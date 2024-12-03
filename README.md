# Foody: Restaurant Management System

A full-stack application for managing restaurant operations including orders, inventory, and staff.

## Prerequisites

- Docker
- Docker Compose

## Setup

1. Clone the repository:

    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2. Create the `.env` files for both the backend and frontend:

    - Backend (`back/.env`):

        ```sh
        cp back/.env-example back/.env
        ```

    - Frontend (`front/.env`):

        ```sh
        cp front/.env-example front/.env
        ```

3. Build and run the Docker containers using Docker Compose:

    ```sh
    docker-compose up --build
    ```

4. Access the application:

    - Backend: http://localhost:3000
    - Frontend: http://localhost:5000

## Additional Information

- The backend service runs on port 3000.
- The frontend service runs on port 5000.
- The Docker Compose setup includes a volume for persistent storage of images.

## Authors

- Vicente Nava Montoya
- Gabriel Nayib Castul Lazo 
- Víctor Eduardo Mendoza Vertíz 
- Jorge Teodoro Dawn Rodríguez  
- Karyme Maylin Bautista Poot 