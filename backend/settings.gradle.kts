rootProject.name = "Restaurant"

listOf(
    "Common",
    "service-discovery",
    "api-gateway",
    "user-service",
    "notification-service",
    "chat-service",
    "restaurant-service",
    "dashboard-service",
    "recommendation-service",
    "blog-service",
    "payment-service",
    "order-service"
).forEach { module ->
    val dir = file(module)
    if (dir.exists()) {  //chỉ include nếu folder tồn tại
        include(":$module")
    }
}