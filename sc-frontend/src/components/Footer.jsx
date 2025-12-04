// src/components/Footer.jsx
import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-line">
        상명대학교 | 서울 캠퍼스 | 02-2287-5114 | 서울시 종로구 홍지문 2길 20 상명대학교 |{" "}
        <a
          href="https://www.smu.ac.kr/kor/index.do#a"
          target="_blank"
          rel="noreferrer"
          className="footer-link"
        >
          https://www.smu.ac.kr/kor/index.do#a
        </a>
      </div>
      <div className="footer-line">
        COPYRIGHT BY Smunity. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
}

export default Footer;
