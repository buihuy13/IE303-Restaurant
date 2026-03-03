rootProject.name = "Restaurant"

listOf(
    "Common",
    "service-discovery",
    "api-gateway",
    "user-service",
    "notification-service",
    "chat-service",
    "restaurant-service",
    "recommendation-service",
    "blog-service"
).forEach { module ->
    val dir = file(module)
    if (dir.exists()) {  //chỉ include nếu folder tồn tại
        include(":$module")
    }
}