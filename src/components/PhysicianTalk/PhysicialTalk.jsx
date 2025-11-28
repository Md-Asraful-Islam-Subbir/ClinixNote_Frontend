import React from 'react'
import './PhysicianTalk.css'
import {assets} from '../../assets/assets'
import { Link } from "react-router-dom";
const PhysicialTalk = () => {
  return (
    <div className="page-container">
    <div className="content-wrapper">
      <div className="grid-container">
        {/* Text Content */}
        <div className="text-content">
          <h1 className="title">
            AI-centric solutions
            <br />
            <span className="subtitle">for human-centric medicine</span>
          </h1>
          <p className="description">
            From the emergency department to primary care, ClinixNote handles the
            EHR documentation, allowing clinicians to stay fully engaged with
            their patients.
          </p>
          <p className="description">
            ClinixNote ambient AI captures the conversation in the exam room
            and generates accurate, complete, and easy-to-read medical notes.
          </p>
          <p className="description">
            With a range of products tailored to different needs and budgets,
            ClinixNote is helping organizations place a renewed focus on the
            doctor-patient relationship.
          </p>
          <button className="explore-button">Explore Products</button>
        </div>

        {/* Image Content */}
        <div className="image-container">
          <img src={assets.Physician} alt=""  className="image" />
        </div>
      </div>
      <div className="testimonials-section">
      <h2 className="testimonials-title">
            <span className="highlighted-title">A welcome change</span>
            <br />
            <span className="subtitle">for physicians</span>
          </h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-text">
                “This technology is transformative. In my 23 years of practice,
                ClinixNote Go is the biggest leap forward in technology that
                I’ve seen.”
              </p>
              <p className="testimonial-author">Dr. Stephen Beck</p>
              <p className="testimonial-position">Alabama Oncology</p>
              <img
                src={assets.Physician1}
                alt="Dr. Stephen Beck"
                className="testimonial-image"
              />
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                “Total game changer. I’m taking lunch breaks for the first time in
                years, and I was even able to attend my kid’s school play for the
                first time.”
              </p>
              <p className="testimonial-author">Dr. Robert Grigg, DMSc, PA-C</p>
              <p className="testimonial-position">Paradise Medical Group</p>
              <img
                src={assets.Physician1}
                alt="Dr. Robert Grigg"
                className="testimonial-image"
              />
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                “ClinixNote has been life changing for me! It’s a great service that
                every physician should be using.”
              </p>
              <p className="testimonial-author">Dr. Mani Nezhad</p>
              <p className="testimonial-position">Dignity Health Medical Group</p>
              <img
                src={assets.Physician1}
                alt="Dr. Mani Nezhad"
                className="testimonial-image"
              />
            </div>
            <Link to="/view-doctor" className="view-doctor-btn">

      View Doctor
    </Link>
          </div>
        </div>
    </div>
  </div>

  
  )
}

export default PhysicialTalk