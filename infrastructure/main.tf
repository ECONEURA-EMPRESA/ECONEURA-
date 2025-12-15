provider "google" {
  project = "econeura-109cc"
  region  = "us-central1"
}

# HABILITAR APIS
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "compute.googleapis.com",
    "servicenetworking.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com"
  ])
  service = each.key
  disable_on_destroy = false
}

# SQL INSTANCE
resource "google_sql_database_instance" "master" {
  name             = "econeura-prod-db"
  database_version = "POSTGRES_15"
  region           = "us-central1"
  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled = true # DEV ONLY: Set to false in prod for Private IP
    }
  }
  deletion_protection = false # DEV ONLY
}

resource "google_sql_database" "db" {
  name     = "econeura"
  instance = google_sql_database_instance.master.name
}

resource "google_sql_user" "u" {
  name     = "postgres"
  instance = google_sql_database_instance.master.name
  password = "changeme123" 
}

# CLOUD RUN
resource "google_cloud_run_v2_service" "backend" {
  name     = "econeura-backend"
  location = "us-central1"
  template {
    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder until build
      env {
        name = "INSTANCE_CONNECTION_NAME"
        value = google_sql_database_instance.master.connection_name
      }
      env {
        name = "DB_HOST"
        value = "/cloudsql/${google_sql_database_instance.master.connection_name}"
      }
      env {
        name = "DB_USER"
        value = google_sql_user.u.name
      }
      env {
        name = "DB_PASSWORD"
        value = google_sql_user.u.password
      }
      env {
        name = "DB_NAME"
        value = google_sql_database.db.name
      }
      # Secrets injection would go here
      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }
    }
    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [google_sql_database_instance.master.connection_name]
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version
    ]
  }
}

resource "google_cloud_run_v2_service_iam_member" "noauth" {
  location = google_cloud_run_v2_service.backend.location
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

