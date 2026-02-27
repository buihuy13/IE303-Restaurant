rootProject.name = "Restaurant"

include (
    ":Common",
    ":service-discovery",
    "api-gateway",
    "user-service",
    "notification-service",
    "chat-service",
    "restaurant-service",
    "recommendation-service",
)