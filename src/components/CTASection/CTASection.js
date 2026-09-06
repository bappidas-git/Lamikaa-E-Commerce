import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CTASection.module.css";

const CTASection = ({ title = "Discover Amazing Deals", subtitle = "Shop the latest trends at unbeatable prices", buttonText = "Shop Now", link = "/products" }) => {
  const navigate = useNavigate();

  return (
    <section className={styles.cta}>
      <div className={styles.content}>
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <button onClick={() => navigate(link)} className={styles.ctaBtn}>{buttonText}</button>
      </div>
    </section>
  );
};

export default CTASection;
