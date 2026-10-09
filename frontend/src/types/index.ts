export interface Product {
  id: string;
  name: string;
  category: 'Electronics' | 'Food' | 'Grocery' | 'Dairy' | 'Fresh Produce' | string;
  price: number;
  currency: string;
  image_url: string;
  description: string;
  delivery_estimate?: string;
  reasons: string[];
  quantity?: number;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  product: Product;
  items?: Array<{ product: Product; quantity: number; price: number }>;
  price: number;
  currency: string;
  status: string;
  order_date: string;
  delivery_date: string;
  serial_number?: string;
  address?: string;
  payment_method?: string;
}

export interface CustomerRiskProfile {
  user_id?: string;
  customer_name?: string;
  account_age_months?: number;
  account_age_display?: string;
  total_orders?: number;
  total_refunds?: number;
  refund_rate_pct?: number;
  refunds_last_30_days?: number;
  refunds_last_7_days?: number;
  previous_fraud_flags?: number;
  address_consistency?: 'CONSISTENT' | 'NEW' | 'UNUSUAL' | string;
  address_changes_last_30d?: number;
  customer_risk_level?: 'LOW' | 'ELEVATED' | 'HIGH' | string;
  risk_score?: number;
  explanation?: string;
}

export interface ObjectDetectionData {
  detected_objects: string[];
  primary_object: string;
  ordered_object_detected: boolean;
  confidence?: number;
  status?: string;
  explanation?: string;
}

export interface ObjectCountingData {
  expected_quantity: number;
  detected_quantity: number;
  quantity_discrepancy: number;
  count_match_score: number;
  status?: string;
  explanation?: string;
}

export interface OCRAnalysisData {
  ocr_detected: boolean;
  extracted_text: string;
  detected_labels?: string[];
  expiry_date_found?: string | null;
  serial_number_found?: string | null;
  serial_match?: boolean;
  ocr_confidence?: number;
  explanation?: string;
}

export interface AnalysisResult {
  id?: string;
  evidence_id: string;
  claim_id: string;
  ai_generation_score: number;
  ai_generation_status: string;
  manipulation_score: number;
  manipulation_status: string;
  screen_photo_score: number;
  screen_photo_status: string;
  provenance_score: number;
  provenance_status: string;
  product_match_score: number;
  product_match_status: string;
  damage_score: number;
  damage_type: string;
  damage_status: string;
  claim_consistency_score: number;
  claim_consistency_status: string;
  evidence_trust_score: number;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  recommended_action: 'AUTO_APPROVE' | 'APPROVE_REFUND' | 'MANUAL_REVIEW' | 'REQUEST_MORE_EVIDENCE' | 'HIGH_RISK' | string;
  reasons: string[];
  signals: {
    ai_explanation: string;
    manipulation_signals: string[];
    screen_signals: string[];
    exif_details: Record<string, string>;
  };
  object_detection?: ObjectDetectionData;
  object_counting?: ObjectCountingData;
  ocr_analysis?: OCRAnalysisData;
  customer_risk_profile?: CustomerRiskProfile;
  image_url?: string;
  created_at?: string;
}

export interface RefundClaim {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  reason: string;
  description: string;
  status: string;
  created_at: string;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH';
  evidence_trust_score?: number;
  recommended_action?: string;
  customer_risk_profile?: CustomerRiskProfile;
  latest_analysis?: AnalysisResult;
  review_decision?: {
    id: string;
    decision: string;
    reviewer_notes: string;
    reviewer_id: string;
    created_at: string;
  };
}

export interface AnalyticsSummary {
  total_claims: number;
  claims_analyzed: number;
  refund_value_inr?: number;
  low_risk_claims?: number;
  medium_risk_claims?: number;
  high_risk_claims: number;
  manual_reviews: number;
  approved_claims: number;
  suspicious_evidence?: number;
  product_mismatches?: number;
  quantity_mismatches?: number;
  evidence_mismatches?: number;
  suspicious_customer_patterns?: number;
  estimated_fraud_prevented_inr: number;
  risk_distribution: Array<{ name: string; value: number; color: string }>;
  category_breakdown?: Array<{
    category: string;
    count?: number;
    claims?: number;
    fraud_pct?: number;
    color: string;
  }>;
  top_refund_reasons?: Array<{
    reason: string;
    count: number;
    percentage: string;
  }>;
}

export interface ParadoxScenario {
  headline: string;
  scenario_a: {
    title: string;
    description: string;
    ai_detector_score: number;
    ai_detector_verdict: string;
    screen_photo_score: number;
    provenance_score: number;
    evidence_trust_score: number;
    refundshield_risk: string;
    refundshield_decision: string;
    explanation: string;
  };
  scenario_b: {
    title: string;
    description: string;
    ai_detector_score: number;
    ai_detector_verdict: string;
    screen_photo_score: number;
    screen_photo_verdict: string;
    provenance_score: number;
    evidence_trust_score: number;
    refundshield_risk: string;
    refundshield_decision: string;
    explanation: string;
  };
}
