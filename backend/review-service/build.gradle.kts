plugins {
	id("org.springframework.boot")
}

extra["springCloudVersion"] = "2025.0.0"

dependencies {
	implementation(project(":Common"))
	testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("org.springframework.cloud:spring-cloud-starter-openfeign")
	compileOnly("org.projectlombok:lombok")
	annotationProcessor("org.projectlombok:lombok")
	implementation("io.github.cdimascio:dotenv-java:3.2.0")
	implementation("org.springframework.boot:spring-boot-starter-actuator")
	implementation("io.micrometer:micrometer-tracing-bridge-brave")
	implementation("io.zipkin.reporter2:zipkin-reporter-brave")
	implementation("org.springframework.cloud:spring-cloud-starter-netflix-eureka-client")
	developmentOnly("org.springframework.boot:spring-boot-devtools")
	runtimeOnly("org.postgresql:postgresql")
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-security")
	testImplementation("org.springframework.security:spring-security-test")
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.8")
	implementation("org.mapstruct:mapstruct:1.6.3")
	annotationProcessor("org.mapstruct:mapstruct-processor:1.6.3")
}

dependencyManagement {
	imports {
		mavenBom("org.springframework.cloud:spring-cloud-dependencies:${property("springCloudVersion")}")
	}
}
