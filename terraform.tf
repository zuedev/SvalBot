# This TF is currently not used in live, purely used as reference for the future

terraform {
  required_providers {
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "1.8.2"
    }
  }
  cloud {
    organization = "zuedev"
    workspaces {
      name = "gitlab-com_zuedev_svalbot"
    }
  }
}

variable "mongodbatlas_public_key" {}
variable "mongodbatlas_private_key" {}

provider "mongodbatlas" {
  public_key  = var.mongodbatlas_public_key
  private_key = var.mongodbatlas_private_key
}

data "mongodbatlas_roles_org_id" "zuedev" {
}

resource "mongodbatlas_project" "svalbot" {
  name   = "SvalBot"
  org_id = data.mongodbatlas_roles_org_id.zuedev.org_id
}

resource "mongodbatlas_project_ip_access_list" "zuedev" {
  project_id = mongodbatlas_project.svalbot.id
  ip_address = "86.30.52.175"
  comment    = "ip of zuedev's vpn"
}

resource "mongodbatlas_serverless_instance" "production" {
  project_id                              = mongodbatlas_project.svalbot.id
  name                                    = "Production"
  provider_settings_backing_provider_name = "GCP"
  provider_settings_provider_name         = "SERVERLESS"
  provider_settings_region_name           = "WESTERN_EUROPE"
  continuous_backup_enabled               = true
  termination_protection_enabled          = true
}

resource "mongodbatlas_serverless_instance" "development" {
  project_id                              = mongodbatlas_project.svalbot.id
  name                                    = "Development"
  provider_settings_backing_provider_name = "GCP"
  provider_settings_provider_name         = "SERVERLESS"
  provider_settings_region_name           = "WESTERN_EUROPE"
  continuous_backup_enabled               = true
  termination_protection_enabled          = true
}
