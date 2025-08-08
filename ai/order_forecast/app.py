from flask import jsonify, request
import os
import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import r2_score, mean_absolute_error

# ====== 간단 설정 ======
DATA_DIR = "./ai/order_forecast/"
HISTORY_CSV_PATH = os.path.join(DATA_DIR, "pos_order_history.csv")
DEFAULT_MIN_MONTHS = 6
TARGET_COL = "ordered_quantity"
ID_COLS = ["date", "store_id", "product_code"]
INFO_COLS = ["product_code", "product_name", "main_category", "sub_category", "unit"]
NUM_COLS = ["stock_level", "sales_quantity", "expiration_days_left", TARGET_COL]

os.makedirs(DATA_DIR, exist_ok=True)

# ====== 유틸 ======
def _get_min_months() -> int:
    val = request.args.get("min_months") or request.form.get("min_months")
    try:
        return max(1, int(val)) if val is not None else DEFAULT_MIN_MONTHS
    except:
        return DEFAULT_MIN_MONTHS

def _parse_month_series(s: pd.Series) -> pd.Series:
    s = s.astype(str).apply(lambda x: x if len(x) > 7 else x + "-01")
    return pd.to_datetime(s, errors="coerce")

def _load_history() -> pd.DataFrame:
    if not os.path.exists(HISTORY_CSV_PATH):
        cols = ID_COLS + INFO_COLS[1:] + NUM_COLS
        return pd.DataFrame(columns=cols)
    return pd.read_csv(HISTORY_CSV_PATH)

def _dedupe_concat(base: pd.DataFrame, add: pd.DataFrame) -> pd.DataFrame:
    for c in set(base.columns) - set(add.columns):
        add[c] = np.nan
    for c in set(add.columns) - set(base.columns):
        base[c] = np.nan
    df = pd.concat([base[add.columns], add], ignore_index=True)
    df["date"] = _parse_month_series(df["date"])
    df = df[df["date"].notnull()].copy()
    df.sort_values(by=["date"], inplace=True)
    df = df.drop_duplicates(subset=ID_COLS, keep="last").reset_index(drop=True)
    return df

def _ensure_min_months(df: pd.DataFrame, cutoff_month: pd.Timestamp, min_months: int) -> pd.DataFrame:
    hist = df[df["date"] <= cutoff_month].copy()
    cnt = (
        hist.groupby(["store_id", "product_code"])["date"]
        .nunique()
        .reset_index(name="n_months")
    )
    ok = cnt[cnt["n_months"] >= min_months][["store_id", "product_code"]]
    return ok

def _build_future_frame(df: pd.DataFrame, predict_month: pd.Timestamp, ok_pairs: pd.DataFrame) -> pd.DataFrame:
    product_info = df[INFO_COLS].drop_duplicates("product_code")
    future = ok_pairs.copy()
    future["date"] = predict_month
    future["stock_level"] = 0
    future["sales_quantity"] = 0
    future["expiration_days_left"] = 180
    future[TARGET_COL] = 0
    future = future.merge(product_info, on="product_code", how="left")
    cols = ["date", "store_id", "product_code"] + INFO_COLS[1:] + NUM_COLS
    return future[cols]

def _preprocess_for_model(full_df: pd.DataFrame, predict_month: pd.Timestamp):
    df = full_df.copy()
    df["date"] = _parse_month_series(df["date"])
    df = df[df["date"].notnull()].sort_values("date").reset_index(drop=True)
    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month

    group_cols = ["store_id", "product_code"]
    df = df.groupby(group_cols, group_keys=False).apply(lambda x: x.sort_values("date")).reset_index(drop=True)

    for i in range(1, 4):
        df[f"sales_lag_{i}"] = df.groupby(group_cols)["sales_quantity"].shift(i)
    df["sales_rolling_mean_3"] = df.groupby(group_cols)["sales_quantity"].transform(
        lambda x: x.rolling(window=3, min_periods=1).mean()
    )

    df = df.fillna(0)
    train = df[df["date"] < predict_month].copy()
    test  = df[df["date"] == predict_month].copy()

    cat_cols = ["store_id", "product_code", "main_category", "sub_category", "unit"]
    for c in cat_cols:
        train = pd.get_dummies(train, columns=[c], prefix=c)
        test  = pd.get_dummies(test,  columns=[c], prefix=c)

    missing_cols = set(train.columns) - set(test.columns)
    for c in missing_cols:
        test[c] = 0

    drop_cols = [TARGET_COL, "date", "product_name"]
    keep_cols = [c for c in train.columns if c not in drop_cols]
    X_train, y_train = train[keep_cols], train[TARGET_COL]
    X_test = test[keep_cols]

    meta_cols = ["date", "store_id", "product_code", "product_name", "unit", "main_category", "sub_category"]
    meta = test[meta_cols] if all([m in test.columns for m in meta_cols]) else df[df["date"] == predict_month][meta_cols]
    return X_train, y_train, X_test, meta

def _train_predict(X_train, y_train, X_test):
    preds = []
    val_scores = []
    n_splits = min(5, max(2, len(X_train) // 50))
    tscv = TimeSeriesSplit(n_splits=n_splits)
    for tr_idx, va_idx in tscv.split(X_train):
        model = lgb.LGBMRegressor(n_estimators=300, learning_rate=0.05, max_depth=-1, random_state=42)
        model.fit(X_train.iloc[tr_idx], y_train.iloc[tr_idx],
                  eval_set=[(X_train.iloc[va_idx], y_train.iloc[va_idx])])
        preds.append(model.predict(X_test))
        val_pred = model.predict(X_train.iloc[va_idx])
        val_scores.append((r2_score(y_train.iloc[va_idx], val_pred),
                           mean_absolute_error(y_train.iloc[va_idx], val_pred)))
    y_pred = np.mean(preds, axis=0) if preds else lgb.LGBMRegressor().fit(X_train, y_train).predict(X_test)
    r2_avg = np.mean([x[0] for x in val_scores])
    mae_avg = np.mean([x[1] for x in val_scores])
    return np.maximum(0, np.rint(y_pred).astype(int)), r2_avg, mae_avg

# ====== 게이트웨이에서 호출 ======
def predict_order(file_storage):
    if file_storage is None:
        return jsonify({"success": False, "data": None, "error": "CSV file is missing"}), 400

    history = _load_history()
    try:
        upload_df = pd.read_csv(file_storage)
    except Exception as e:
        return jsonify({"success": False, "data": None, "error": f"failed to read uploaded csv: {e}"}), 400

    required = set(["date","store_id","product_code","product_name","main_category","sub_category","unit",
                    "stock_level","sales_quantity","expiration_days_left","ordered_quantity"])
    missing = required - set(upload_df.columns)
    if missing:
        return jsonify({"success": False, "data": None, "error": f"missing columns in upload: {sorted(list(missing))}"}), 400

    try:
        merged = _dedupe_concat(history, upload_df)
    except Exception as e:
        return jsonify({"success": False, "data": None, "error": f"failed to concat/dedupe: {e}"}), 500
    if merged.empty:
        return jsonify({"success": False, "data": None, "error": "no data after merge"}), 400

    upload_month = _parse_month_series(upload_df["date"]).max()
    if pd.isna(upload_month):
        return jsonify({"success": False, "data": None, "error": "invalid upload month"}), 400
    predict_month = (upload_month + pd.DateOffset(months=1)).replace(day=1)

    min_months = _get_min_months()
    ok_pairs = _ensure_min_months(merged, cutoff_month=upload_month, min_months=min_months)
    if ok_pairs.empty:
        return jsonify({"success": False, "data": None,
                        "error": f"At least {min_months} months of history required for each (store_id, product_code)."}), 400

    future_df = _build_future_frame(merged, predict_month, ok_pairs)
    full_df = pd.concat([merged, future_df], ignore_index=True)

    try:
        X_train, y_train, X_test, meta = _preprocess_for_model(full_df, predict_month=predict_month)
        if len(X_train) == 0 or len(X_test) == 0:
            return jsonify({"success": False, "data": None, "error": "Not enough rows to train or predict"}), 400
        y_pred, r2_score_avg, mae_score_avg = _train_predict(X_train, y_train, X_test)
    except Exception as e:
        return jsonify({"success": False, "data": None, "error": f"model failure: {e}"}), 500

    try:
        save_df = merged.copy()
        save_df["date"] = save_df["date"].dt.strftime("%Y-%m")
        save_df.to_csv(HISTORY_CSV_PATH, index=False)
    except Exception as e:
        print(f"[WARN] history save failed: {e}")

    meta = meta.reset_index(drop=True)
    meta["predicted_order"] = y_pred
    results = []
    for _, r in meta.iterrows():
        results.append({
            "product_name": r.get("product_name"),
            "product_code": r.get("product_code"),
            "predicted_quantity": int(r.get("predicted_order", 0)),
            "store_id": r.get("store_id"),
            "unit": r.get("unit"),
            "main_category": r.get("main_category"),
            "sub_category": r.get("sub_category")
        })

    return jsonify({
        "success": True,
        "model_score": {
            "r2": round(r2_score_avg, 4),
            "mae": round(mae_score_avg, 2)
        },
        "data": results,
        "error": None
    }), 200  