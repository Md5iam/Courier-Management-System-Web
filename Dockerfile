# ==========================================
# Stage 1: Build React Frontend (Vite)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Build Spring Boot Standalone JAR
# ==========================================
FROM maven:3.9-eclipse-temurin-17 AS backend-builder
WORKDIR /app

COPY pom.xml ./
# Cache dependencies in Docker layer
RUN mvn dependency:go-offline -B

COPY src ./src
# Copy compiled static frontend into Spring Boot static resources directory
COPY --from=frontend-builder /app/src/main/resources/static ./src/main/resources/static

RUN mvn clean package -DskipTests -B

# ==========================================
# Stage 3: Lightweight Production JRE Image
# ==========================================
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create non-root user for security
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

COPY --from=backend-builder /app/target/*.jar app.jar

EXPOSE 8080
ENV PORT=8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
