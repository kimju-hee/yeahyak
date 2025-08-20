import React, { useMemo, useState, useEffect } from "react";
import { Button, Flex, Row, Col } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import logoImg from "../../assets/landing/logo.png";
import heroImg from "../../assets/landing/hero.png";
import slide1 from "../../assets/landing/slide-1.png";
import slide2 from "../../assets/landing/slide-2.png";
import slide3 from "../../assets/landing/slide-3.png";
import slide4 from "../../assets/landing/slide-4.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const slides = useMemo(() => [slide1, slide2, slide3, slide4], []);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const content = document.querySelector(".ant-layout-content") as HTMLElement | null;
    const footer = document.querySelector(".ant-layout-footer") as HTMLElement | null;

    const prev = {
      bodyMargin: document.body.style.margin,
      htmlMargin: document.documentElement.style.margin,
      htmlPadding: document.documentElement.style.padding,
      contentPadding: content?.style.padding ?? "",
      contentMargin: content?.style.margin ?? "",
      footerPaddingTop: footer?.style.paddingTop ?? "",
      footerMarginTop: footer?.style.marginTop ?? "",
    };

    document.body.style.margin = "0";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";

    if (content) {
      content.style.padding = "0";
      content.style.margin = "0";
    }
    if (footer) {
      footer.style.paddingTop = "0";
      footer.style.marginTop = "0";
    }

    return () => {
      document.body.style.margin = prev.bodyMargin;
      document.documentElement.style.margin = prev.htmlMargin;
      document.documentElement.style.padding = prev.htmlPadding;
      if (content) {
        content.style.padding = prev.contentPadding;
        content.style.margin = prev.contentMargin;
      }
      if (footer) {
        footer.style.paddingTop = prev.footerPaddingTop;
        footer.style.marginTop = prev.footerMarginTop;
      }
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const go = (d: number) => setIdx((p) => (p + d + slides.length) % slides.length);
  const prevIdx = (idx - 1 + slides.length) % slides.length;
  const nextIdx = (idx + 1) % slides.length;

  return (
    <Flex vertical style={sx.page}>
      <Flex style={{ ...sx.center, ...sx.header }} align="center" justify="center">
        <img src={logoImg} alt="Yeah! Yak" style={sx.logo} />
        <Flex gap="small" wrap style={sx.loginBtn}>
          <Button type="primary" onClick={() => navigate("/login")}>Login</Button>
        </Flex>
      </Flex>

      <Flex style={{ ...sx.center, ...sx.heroBox }}>
        <img src={heroImg} alt="hero" style={sx.heroImg} />
      </Flex>

      <Flex style={{ ...sx.center, ...sx.deck }} vertical align="center">
        <Row style={sx.peekRow}>
          <Col
            flex="1"
            style={{
              ...sx.peekCol,
              backgroundImage: `url(${slides[prevIdx]})`,
              backgroundPosition: "left center",
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
            }}
          />
          <Col flex="none" style={sx.mainCol}>
            <img src={slides[idx]} alt={`slide-${idx + 1}`} style={sx.mainImgOriginal} />
          </Col>
          <Col
            flex="1"
            style={{
              ...sx.peekCol,
              backgroundImage: `url(${slides[nextIdx]})`,
              backgroundPosition: "right center",
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
            }}
          />
        </Row>

        <Flex style={sx.captionBar} justify="center" gap={8}>
          {slides.map((_, i) => (
            <span
              key={i}
              onClick={() => setIdx(i)}
              style={{
                ...sx.dot,
                opacity: i === idx ? 1 : 0.35,
                transform: i === idx ? "scale(1.05)" : "scale(1)",
              }}
            />
          ))}
        </Flex>

        <Button aria-label="prev" onClick={() => go(-1)} style={{ ...sx.navBtn, left: -14 }} icon={<LeftOutlined />} />
        <Button aria-label="next" onClick={() => go(1)} style={{ ...sx.navBtn, right: -14 }} icon={<RightOutlined />} />
      </Flex>

      <Flex style={{ ...sx.center, ...sx.footer }} align="center" justify="space-between" wrap>
        <span><strong>가맹 문의</strong> 010-7115-5860</span>
        <span><strong>대표자</strong> 최진호</span>
        <span><strong>E-mail</strong> <a href="mailto:pj20jo@yeahyak.com" style={sx.mail}>pj20jo@yeahyak.com</a></span>
      </Flex>
    </Flex>
  );
}

const MAX_W = 880;
const HERO_H = 380;
const CARD_H = 360;

const sx: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    paddingBottom: 0,
    marginBottom: 0,
  },
  center: {
    width: "100%",
    maxWidth: MAX_W,
    margin: "0 auto",
    paddingInline: 12,
  },
  header: {
    position: "relative",
    paddingTop: 2,
    paddingBottom: 2,
  },
  logo: {
    height: "clamp(56px, 8vw, 88px)",
    objectFit: "contain",
  },
  loginBtn: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: "translateY(-50%)",
  },
  heroBox: {
    width: "100%",
    height: HERO_H,
    borderRadius: 12,
    overflow: "hidden",
  },
  heroImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    borderRadius: 12,
  },
  deck: {
    position: "relative",
    width: "100%",
    borderRadius: 6,
    padding: "12px 12px 10px",
  },
  peekRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    height: CARD_H,
    width: "100%",
  },
  peekCol: {
    height: "100%",
    backgroundSize: "cover",
    filter: "blur(2px) brightness(0.92)",
  },
  mainCol: {
    height: "100%",
    display: "grid",
    placeItems: "center",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 18px rgba(0,0,0,.08)",
    paddingInline: 8,
  },
  mainImgOriginal: {
    maxHeight: CARD_H - 16,
    maxWidth: "100%",
    height: "auto",
    width: "auto",
    display: "block",
    objectFit: "contain",
  },
  navBtn: {
    position: "absolute",
    top: 12 + CARD_H / 2 - 28,
    transform: "translateY(-50%)",
    width: 44,
    height: 56,
    borderRadius: 12,
    border: "2px solid #0D1B2A",
    background: "#fff",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    zIndex: 1,
  },
  captionBar: {
    marginTop: 12,
    paddingBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#1677ff",
    border: "2px solid #0D1B2A",
    cursor: "pointer",
    transition: "all .15s",
  },
  footer: {
    background: "#1677ff",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 12,
    fontWeight: 600,
    gap: 12,
    marginTop: "auto",
    marginBottom: 0,
  },
  mail: {
    color: "#fff",
    textDecoration: "underline",
  },
};
