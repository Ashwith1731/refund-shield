# 🛡️ REFUNDSHIELD

### AI-Powered Refund Evidence Verification Engine

> **Don't just detect fake images. Verify the evidence.**

RefundShield helps e-commerce platforms evaluate whether customer-submitted refund evidence is trustworthy using multimodal computer vision, optical frequency forensics, EXIF metadata analysis, catalog embedding matching, and transactional context.

---

## 🎯 Problem Statement & Scientific Honesty

A major vulnerability facing e-commerce platforms is **re-photography refund fraud**:

```text
AI-generated synthetic image
        ↓
Displayed on another phone / laptop screen
        ↓
Photographed using a real camera
        ↓
Submitted as "camera evidence"
```

A conventional AI-image detector may identify the original synthetic file with 99% confidence, but fails when analyzing the photograph of the display because camera lens optics obscure synthetic noise patterns.

> **RefundShield does NOT depend on a single AI-image detector.**
> Instead, it combines multiple independent signals into an overall **EVIDENCE TRUST SCORE**.

### Scientific Disclaimer
*RefundShield estimates evidence authenticity and refund risk using multiple signals to assist human decision-making. Forensic and AI scores should not be used as the sole basis for denying real-world customer refunds.*

---

## 🏗 Architecture & Multimodal Signal Flow

```text
                 ┌───────────────────────────┐
                 │ AI Generation Detection   │
                 └─────────────┬─────────────┘
                               │
                 ┌─────────────▼─────────────┐
                 │ Manipulation (ELA)        │
                 └─────────────┬─────────────┘
                               │
                 ┌─────────────▼─────────────┐
                 │ Screen-Photo (FFT Moiré)  │
                 └─────────────┬─────────────┘
                               │
                 ┌─────────────▼─────────────┐
                 │ EXIF Hardware Provenance  │
                 └─────────────┬─────────────┘
                               │
                 ┌─────────────▼─────────────┐
                 │ Catalog Product Match     │
                 └─────────────┬─────────────┘
                               │
                 ┌─────────────▼─────────────┐
                 │ Damage Contour Detection  │
                 └─────────────┬─────────────┘
                               │
                 ┌─────────────▼─────────────┐
                 │ Claim Consistency Engine  │
                 └─────────────┬─────────────┘
                               │
                 ┌─────────────▼─────────────┐
                 │ EVIDENCE TRUST ENGINE     │
                 └─────────────┬─────────────┘
                               │
                 ┌─────────────▼─────────────┐
                 │ Risk Decision & Action    │
                 └───────────────────────────┘
```

---

## 🚀 Technology Stack

### Frontend
- **React 18** with **TypeScript**
- **Vite** build tooling
- **Tailwind CSS v4** styling design system with glassmorphism
- **React Router v6**
- **Axios** HTTP client
- **Lucide React** icon suite

### Backend
- **Python 3.11**
- **FastAPI** ASGI web framework
- **Uvicorn** high-performance server
- **Pydantic v2** schema validation
- **OpenCV (cv2)** 2D Fast Fourier Transform (FFT) & contour analysis
- **Pillow (PIL)** EXIF tag parsing & Error Level Analysis (ELA)
- **NumPy** matrix signal processing
- **scikit-learn** feature extraction

### Database
- **MongoDB** (with clean in-memory `MockDatabase` fallback)

---

## ⚙️ Environment Variables

Create `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=refundshield
AI_MODEL_MODE=demo
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
PORT=8000
HOST=0.0.0.0
```

---

## 🏃 Quickstart Guide

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtualenv (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start FastAPI Uvicorn Server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

FastAPI interactive Swagger documentation will be available at:
`http://127.0.0.1:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install packages
npm install

# Start Vite Development Server
npm run dev
```

Application will run locally at:
`http://localhost:5173`

---

## 🐳 Running with Docker Compose

To launch the full stack (Frontend, Backend API, MongoDB):

```bash
docker-compose up --build
```

---

## 🧪 Key Hackathon Demonstration Features

1. **Live Camera Capture Mode**: Real-time camera preview via `navigator.mediaDevices.getUserMedia()` with security anti-screen notices and fallback demo uploads.
2. **AI Detector Paradox Demo**: Interactive side-by-side comparison showing how a single AI detector drops from 99% to 10% on screen photos, while RefundShield's FFT Moiré engine flags it.
3. **One-Click Demo Scenarios**: Instant test suite covering Genuine Damaged Products, AI Images, Photographed Screens, Wrong Products, and Image Manipulation.
4. **Fraud Risk Dashboard**: Real-time KPI metrics, risk level breakdown, fraud prevented estimation, and claims audit ledger.
5. **Reviewer Action Workflow**: Manual override modal with automatically generated video evidence instructions.

---

## 📄 API Documentation

- `POST /api/refunds`: Submit a new refund request
- `GET /api/refunds`: List all refund claims
- `GET /api/refunds/{id}`: Get detailed claim audit trail
- `POST /api/evidence/capture`: Capture or upload evidence photo
- `POST /api/evidence/analyze`: Run multimodal computer vision analysis
- `POST /api/reviews`: Record manual reviewer decisions
- `GET /api/analytics`: Fetch dashboard metrics & fraud prevention stats
- `GET /api/demo/paradox`: Retrieve AI Detector Paradox scenario data

---

## ⚖️ Limitations & Future Improvements

- **AI Model Execution**: Uses modular services configured with fallback Demo AI mode. Production deployment supports PyTorch/TensorFlow deep feature extractors.
- **Video Evidence Pipeline**: Phase 13 generates structured video capture checklists; real-time video frame sampling is planned for future iterations.
- **Hardware Integration**: Can be integrated into e-commerce mobile apps for native camera provenance attestation.
