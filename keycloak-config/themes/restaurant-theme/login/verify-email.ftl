<#-- Custom modern verify email page for restaurant-theme -->
<#import "template.ftl" as layout>

<@layout.registrationLayout displayMessage=false; section>

    <#if section = "header">
        <h1 id="kc-page-title" class="auth-title">Verify your email</h1>

    <#elseif section = "form">
        <div id="kc-form-wrapper" class="auth-card">
            <div class="auth-content">
                <div class="auth-icon" aria-hidden="true">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="5" width="18" height="14" rx="2"
                              stroke="currentColor" stroke-width="1.6" />
                        <path d="M3 7L12 13L21 7"
                              stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                              stroke-linejoin="round" />
                    </svg>
                </div>

                <h2 class="auth-title">Verify your email</h2>
                <p class="auth-subtitle">
                    We’ve sent a verification link to your email address. Please check your inbox and click the link
                    to activate your account.
                </p>

                <#-- Keep Keycloak instruction messages -->
                <div class="auth-subtitle">
                    <p>${msg("emailVerifyInstruction1", user.email!)}</p>
                    <p>${msg("emailVerifyInstruction2")}</p>
                </div>

                <#-- Resend / action button if Keycloak provides an action URI -->
                <#if actionUri?has_content>
                    <a class="pf-v5-c-button pf-m-primary resend-email-btn" href="${actionUri}" data-once-link="true">
                        Resend email
                    </a>
                </#if>

                <div id="kc-info" style="margin-top: 18px;">
                    <#if pageRedirectUri?has_content>
                        <a href="${pageRedirectUri}">${msg("backToApplication")}</a>
                    <#elseif (client.baseUrl)?has_content>
                        <a href="${client.baseUrl}">${msg("backToApplication")}</a>
                    <#else>
                        <a href="${url.loginUrl}">${msg("backToLogin")}</a>
                    </#if>
                </div>
            </div>
        </div>
    </#if>

</@layout.registrationLayout>

