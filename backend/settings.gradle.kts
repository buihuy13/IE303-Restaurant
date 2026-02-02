rootProject.name = "Restaurant"

include (
    ":Common",
    ":service-discovery",
    "api-gateway",
    "user-service",
    "auth-service",
)