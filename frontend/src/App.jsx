import { useState } from 'react';
import axios from 'axios';
import './App.css';
import { BACKEND_URL } from '../global_vars';

const initialFormData = {
  HighBP: '0',
  HighChol: '0',
  CholCheck: '1',
  BMI: '25',
  Smoker: '0',
  Stroke: '0',
  HeartDiseaseorAttack: '0',
  PhysActivity: '1',
  Fruits: '1',
  Veggies: '1',
  HvyAlcoholConsump: '0',
  AnyHealthcare: '1',
  NoDocbcCost: '0',
  GenHlth: '3',
  MentHlth: '0',
  PhysHlth: '0',
  DiffWalk: '0',
  Sex: '0',
  Age: '7',
  Education: '4',
  Income: '5',
};

const binaryFields = [
  { name: 'HighBP', label: 'High Blood Pressure', options: ['No', 'Yes'] },
  { name: 'HighChol', label: 'High Cholesterol', options: ['No', 'Yes'] },
  { name: 'CholCheck', label: 'Cholesterol Check (past 5 years)', options: ['No', 'Yes'] },
  { name: 'Smoker', label: 'Smoker (100+ cigarettes lifetime)', options: ['No', 'Yes'] },
  { name: 'Stroke', label: 'Ever Had a Stroke', options: ['No', 'Yes'] },
  { name: 'HeartDiseaseorAttack', label: 'Heart Disease or Attack', options: ['No', 'Yes'] },
  { name: 'PhysActivity', label: 'Physical Activity (past 30 days)', options: ['No', 'Yes'] },
  { name: 'Fruits', label: 'Eats Fruits Daily', options: ['No', 'Yes'] },
  { name: 'Veggies', label: 'Eats Vegetables Daily', options: ['No', 'Yes'] },
  { name: 'HvyAlcoholConsump', label: 'Heavy Alcohol Consumption', options: ['No', 'Yes'] },
  { name: 'AnyHealthcare', label: 'Has Healthcare Coverage', options: ['No', 'Yes'] },
  { name: 'NoDocbcCost', label: 'Could Not See Doctor (cost)', options: ['No', 'Yes'] },
  { name: 'DiffWalk', label: 'Difficulty Walking', options: ['No', 'Yes'] },
  { name: 'Sex', label: 'Sex', options: ['Female', 'Male'] },
];

const genHlthLabels = {
  1: '1 - Excellent',
  2: '2 - Very Good',
  3: '3 - Good',
  4: '4 - Fair',
  5: '5 - Poor',
};

const ageLabels = {
  1: '18-24',
  2: '25-29',
  3: '30-34',
  4: '35-39',
  5: '40-44',
  6: '45-49',
  7: '50-54',
  8: '55-59',
  9: '60-64',
  10: '65-69',
  11: '70-74',
  12: '75-79',
  13: '80+',
};

const educationLabels = {
  1: '1 - Never attended / Kindergarten',
  2: '2 - Elementary',
  3: '3 - Some High School',
  4: '4 - High School Graduate',
  5: '5 - Some College',
  6: '6 - College Graduate',
};

const incomeLabels = {
  1: '1 - Less than $10,000',
  2: '2 - $10,000 - $15,000',
  3: '3 - $15,000 - $20,000',
  4: '4 - $20,000 - $25,000',
  5: '5 - $25,000 - $35,000',
  6: '6 - $35,000 - $50,000',
  7: '7 - $50,000 - $75,000',
  8: '8 - $75,000 or more',
};

function BinarySelect({ field, value, onChange }) {
  return (
    <div className="form-field">
      <label htmlFor={field.name}>{field.label}</label>
      <select
        id={field.name}
        name={field.name}
        value={value}
        onChange={onChange}
      >
        <option value="0">{field.options[0]}</option>
        <option value="1">{field.options[1]}</option>
      </select>
    </div>
  );
}

function SelectField({ name, label, value, onChange, options }) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} value={value} onChange={onChange}>
        {Object.entries(options).map(([val, text]) => (
          <option key={val} value={val}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberField({ name, label, value, onChange, min, max }) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input
        type="number"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
      />
    </div>
  );
}

export default function App() {
  const [formData, setFormData] = useState(initialFormData);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {};
    for (const key in formData) {
      payload[key] = parseFloat(formData[key]);
    }

    try {
      const response = await axios.post(BACKEND_URL + '/api/predict', payload);
      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Failed to get prediction. Is the backend running?'
      );
    } finally {
      setLoading(false);
    }
  };

  const healthConditionFields = binaryFields.filter((f) =>
    ['HighBP', 'HighChol', 'CholCheck', 'Stroke', 'HeartDiseaseorAttack', 'DiffWalk'].includes(f.name)
  );

  const lifestyleFields = binaryFields.filter((f) =>
    ['Smoker', 'PhysActivity', 'Fruits', 'Veggies', 'HvyAlcoholConsump'].includes(f.name)
  );

  const accessFields = binaryFields.filter((f) =>
    ['AnyHealthcare', 'NoDocbcCost'].includes(f.name)
  );

  const sexField = binaryFields.find((f) => f.name === 'Sex');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Diabetes Risk Prediction</h1>
        <p>Enter your health indicators below to assess diabetes risk</p>
      </header>

      <form className="prediction-form" onSubmit={handleSubmit}>
        {/* Health Conditions */}
        <section className="form-section">
          <h2>Health Conditions</h2>
          <div className="form-grid">
            {healthConditionFields.map((field) => (
              <BinarySelect
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={handleChange}
              />
            ))}
            <NumberField
              name="BMI"
              label="BMI (Body Mass Index)"
              value={formData.BMI}
              onChange={handleChange}
              min={1}
              max={100}
            />
            <SelectField
              name="GenHlth"
              label="General Health"
              value={formData.GenHlth}
              onChange={handleChange}
              options={genHlthLabels}
            />
            <NumberField
              name="MentHlth"
              label="Mental Health (bad days, past 30)"
              value={formData.MentHlth}
              onChange={handleChange}
              min={0}
              max={30}
            />
            <NumberField
              name="PhysHlth"
              label="Physical Health (bad days, past 30)"
              value={formData.PhysHlth}
              onChange={handleChange}
              min={0}
              max={30}
            />
          </div>
        </section>

        {/* Lifestyle */}
        <section className="form-section">
          <h2>Lifestyle</h2>
          <div className="form-grid">
            {lifestyleFields.map((field) => (
              <BinarySelect
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={handleChange}
              />
            ))}
          </div>
        </section>

        {/* Healthcare Access */}
        <section className="form-section">
          <h2>Healthcare Access</h2>
          <div className="form-grid">
            {accessFields.map((field) => (
              <BinarySelect
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={handleChange}
              />
            ))}
          </div>
        </section>

        {/* Demographics */}
        <section className="form-section">
          <h2>Demographics</h2>
          <div className="form-grid">
            <BinarySelect
              field={sexField}
              value={formData.Sex}
              onChange={handleChange}
            />
            <SelectField
              name="Age"
              label="Age Category"
              value={formData.Age}
              onChange={handleChange}
              options={ageLabels}
            />
            <SelectField
              name="Education"
              label="Education Level"
              value={formData.Education}
              onChange={handleChange}
              options={educationLabels}
            />
            <SelectField
              name="Income"
              label="Income Level"
              value={formData.Income}
              onChange={handleChange}
              options={incomeLabels}
            />
          </div>
        </section>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Predicting...' : 'Get Prediction'}
        </button>
      </form>

      {error && (
        <div className="result-card result-error">
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div
          className={`result-card ${
            result.prediction === 1 ? 'result-positive' : 'result-negative'
          }`}
        >
          <h2>Prediction Result</h2>
          <div className="result-label">
            {result.prediction === 1
              ? 'At Risk for Diabetes'
              : 'Low Risk for Diabetes'}
          </div>
          {result.probability !== undefined && (
            <div className="result-probability">
              <span className="probability-label">Probability:</span>
              <span className="probability-value">
                {(result.probability * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
