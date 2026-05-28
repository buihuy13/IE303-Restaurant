<#-- Custom info page for restaurant-theme -->
<#import "template.ftl" as layout>

<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <h1 id="kc-page-title">${msg("loginTitle")}</h1>
        <p class="auth-subtitle">Account information</p>

    <#elseif section = "form">
        <div id="kc-form-wrapper" class="auth-card">
            <div class="auth-content">
                <div class="auth-icon" aria-hidden="true">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
                        <path d="M12 8.5V12.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                        <circle cx="12" cy="16" r="1" fill="currentColor" />
                    </svg>
                </div>

                <#if messageHeader??>
                    <h2 class="auth-title">${kcSanitize(messageHeader)?no_esc}</h2>
                <#else>
                    <h2 class="auth-title">${msg("loginTitle")}</h2>
                </#if>

                <#if message?has_content>
                    <#assign messageType = (message.type == 'error')?then('danger', message.type)>
                    <div class="pf-v5-c-alert pf-m-${messageType} alert-${message.type}" aria-live="polite">
                        ${kcSanitize(message.summary)?no_esc}
                    </div>
                </#if>

                <div id="kc-info" class="auth-actions">
                    <#if requiredActions?? && requiredActions?size gt 0>
                        <#list requiredActions as reqActionItem>
                            <p class="auth-note">${kcSanitize(msg("requiredAction.${reqActionItem}"))?no_esc}</p>
                        </#list>
                    </#if>

                    <#if pageRedirectUri?has_content>
                        <a class="pf-v5-c-button pf-m-primary resend-email-btn" href="${pageRedirectUri}">
                            ${msg("backToApplication")}
                        </a>
                    <#elseif actionUri?has_content>
                        <a class="pf-v5-c-button pf-m-primary resend-email-btn" href="${actionUri}">
                            ${msg("doContinue")}
                        </a>
                    <#elseif client?? && client.baseUrl?has_content>
                        <a class="pf-v5-c-button pf-m-primary resend-email-btn" href="${client.baseUrl}">
                            ${msg("backToApplication")}
                        </a>
                    <#else>
                        <a class="pf-v5-c-button pf-m-primary resend-email-btn" href="${url.loginUrl}">
                            ${msg("backToLogin")}
                        </a>
                    </#if>
                </div>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
