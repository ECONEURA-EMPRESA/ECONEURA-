terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = "econeura-109cc"
  region  = "us-central1"
  user_project_override = true
  billing_project       = "econeura-109cc"
}

resource "google_identity_platform_config" "default" {
  provider = google
  project  = "econeura-109cc"
  
  sign_in {
    email {
      enabled = true
      password_required = true
    }
  }
}
