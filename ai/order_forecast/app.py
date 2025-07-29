from flask import Flask, request, jsonify
import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import TimeSeriesSplit

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict_order(file):
    if 'file' not in request.files:
        return jsonify({'error': 'CSV file is missing'}), 400

    file = request.files['file']
    df = pd.read_csv(file)

    # 1. 날짜 전처리: 문자열 처리 + datetime 변환 + 결측 제거
    df['date'] = df['date'].astype(str)
    df['date'] = df['date'].apply(lambda x: x if len(x) > 7 else x + '-01')
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df[df['date'].notnull()]  # datetime 변환 실패 제거

    # 2. 다음달 날짜 계산 및 중복 방지
    last_date = df['date'].max()
    next_month = (last_date + pd.DateOffset(months=1)).replace(day=1)
    if next_month in df['date'].values:
        return jsonify({'error': f'{next_month.strftime("%Y-%m")} already exists in data'}), 400

    # 3. 다음달 예측용 데이터 생성 (date는 Timestamp 형 유지)
    store_ids = df['store_id'].unique()
    product_names = df['product_name'].unique()
    future_raw = pd.DataFrame([
        {
            'date': next_month,  # Timestamp로 유지
            'store_id': store,
            'product_name': product,
            'stock_level': 0,
            'sales_quantity': 0,
            'expiration_days_left': 180,
            'ordered_quantity': 0
        }
        for store in store_ids for product in product_names
    ])
    df_full = pd.concat([df, future_raw], ignore_index=True)

    # 4. 전처리 함수 정의
    def preprocess(df):
        df = df.sort_values(by='date')
        df_grouped = df.groupby(['store_id', 'product_name'], group_keys=False)\
                       .apply(lambda x: x.sort_values(by='date')).reset_index(drop=True)

        df_grouped['month'] = df_grouped['date'].dt.month
        df_grouped['year'] = df_grouped['date'].dt.year
        df_grouped['day_of_week'] = df_grouped['date'].dt.dayofweek

        for i in range(1, 4):
            df_grouped[f'sales_quantity_lag_{i}'] = df_grouped.groupby(['store_id', 'product_name'])['sales_quantity'].shift(i)

        df_grouped['sales_quantity_rolling_mean_3'] = df_grouped.groupby(['store_id', 'product_name'])['sales_quantity'].transform(lambda x: x.rolling(window=3).mean())
        df_grouped['sales_quantity_rolling_mean_6'] = df_grouped.groupby(['store_id', 'product_name'])['sales_quantity'].transform(lambda x: x.rolling(window=6).mean())

        df_grouped.fillna(0, inplace=True)

        train = df_grouped[df_grouped['date'] < next_month].copy()
        test = df_grouped[df_grouped['date'] == next_month].copy()

        for col in ['store_id', 'product_name']:
            train = pd.get_dummies(train, columns=[col], prefix=col)
            test = pd.get_dummies(test, columns=[col], prefix=col)

        missing_cols = set(train.columns) - set(test.columns)
        for col in missing_cols:
            test[col] = 0
        test = test[train.columns]

        return train, test

    # 5. 학습 및 예측
    train_data, test_data = preprocess(df_full)
    X_train = train_data.drop(columns=['ordered_quantity', 'date'])
    y_train = train_data['ordered_quantity']
    X_test = test_data.drop(columns=['ordered_quantity', 'date'])

    preds = []
    tscv = TimeSeriesSplit(n_splits=5)
    for train_idx, val_idx in tscv.split(X_train):
        X_t, X_val = X_train.iloc[train_idx], X_train.iloc[val_idx]
        y_t, y_val = y_train.iloc[train_idx], y_train.iloc[val_idx]

        model = lgb.LGBMRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
        model.fit(X_t, y_t, eval_set=[(X_val, y_val)])
        preds.append(model.predict(X_test))

    y_pred = sum(preds) / len(preds)
    test_data['predicted_order'] = y_pred.astype(int)

    # 6. 결과 반환
    original_df = df_full.copy()
    result_base = original_df[original_df['date'] == next_month][['date', 'store_id', 'product_name']].reset_index(drop=True)
    result = pd.concat([result_base, test_data[['predicted_order']].reset_index(drop=True)], axis=1)

    return jsonify(result.to_dict(orient='records')), 200, {'Content-Type': 'application/json; charset=utf-8'}

if __name__ == '__main__':
    app.run(debug=True)
