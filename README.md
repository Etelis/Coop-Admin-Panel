
Co-op Game Admin Panel React Application
========================================

Introduction
------------

This repository hosts the React frontend for the Admin Panel of the Co-op Game project. This application is designed to manage game settings, user data, and analytics, enhancing the administrative capabilities for game researchers and developers. It utilizes modern web technologies to ensure a responsive and user-friendly interface.

Docker Configuration
--------------------

The Dockerfile sets up the environment required to run the admin panel inside a Docker container, utilizing Node.js version 14 (slim version) as its base.

### Highlights:

* **Base Image**: Utilizes `node:14-slim` for a minimal footprint.
* **Working Directory**: Establishes `/usr/src/app` as the primary workspace.
* **Application Files**: Transfers the entire application into the container.
* **Dependency Management**: Installs necessary dependencies and serves the application using `serve`.
* **Port Configuration**: Configures the application to run on port `4200`, prepared for web traffic.

Deploying with Docker to Google Cloud Platform (GCP)
----------------------------------------------------

Follow these steps to deploy the Co-op Game Admin Panel React Application using Docker:

1. **Build the Docker Image**

   ```bash
   docker build -t coopgame-admin-panel .
   ```

2. **Tag the Image for GCP Artifact Registry**
   Replace `<project-id>` and `<repo-name>` with your GCP Project ID and Artifact Registry repository name.

   ```bash
   docker tag coopgame-admin-panel:latest europe-docker.pkg.dev/<project-id>/<repo-name>/admin-panel:latest
   ```

3. **Push the Image to GCP Artifact Registry**
   Authenticate Docker with GCP and push the image.

   ```bash
   gcloud auth configure-docker europe-docker.pkg.dev
   docker push europe-docker.pkg.dev/<project-id>/<repo-name>/admin-panel:latest
   ```

Continuous Integration and Deployment (CI/CD) with GitHub Actions
-----------------------------------------------------------------

GitHub Actions automates the CI/CD process for testing, building, and deploying the application.

### Workflow Overview:

* **On Push to Main Branch**: Activates the workflow when changes are pushed to the `main` branch.
* **Build Step**: Installs dependencies and compiles a production build of the React application.
* **Dockerize and Push**: Constructs a Docker image from the Dockerfile, tags it, and uploads it to Google Cloud Artifact Registry.
* **Deploy to Cloud Run**: Deploys the application to Google Cloud Run using the Docker image, making it available online.

### Key GitHub Actions Used:

* `actions/checkout@v2`: Checks out the code for the GitHub repository.
* `actions/setup-node@v2`: Prepares the Node.js environment.
* `google-github-actions/setup-gcloud@v0.2.1`: Sets up the Google Cloud environment.
* Custom steps for Docker build and deployment.

This CI/CD pipeline streamlines the development and deployment processes, allowing for swift updates and ensuring consistent, error-free deployments.
