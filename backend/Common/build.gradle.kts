plugins {
	id("org.springframework.boot")
}

dependencies {
	compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
	implementation("org.springframework.boot:spring-boot-starter-aop")
}

tasks.bootJar {
	enabled = false
}

// Bật jar task để build plain JAR
tasks.jar {
	enabled = true
}