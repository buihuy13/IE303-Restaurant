<#-- Custom reset password page for restaurant-theme -->
<#import "template.ftl" as layout>

<@layout.registrationLayout displayMessage=true; section>
    <#if section = "header">
        <h1 id="kc-page-title">${msg("emailForgotTitle")}</h1>
        <p class="auth-subtitle">Enter your account email to receive a password reset link.</p>

    <#elseif section = "form">
        <div id="kc-form-wrapper">
            <#if message?has_content>
                <#assign messageType = (message.type == 'error')?then('danger', message.type)>
                <div class="pf-v5-c-alert pf-m-${messageType} alert-${message.type}" aria-live="polite">
                    ${kcSanitize(message.summary)?no_esc}
                </div>
            </#if>

            <form id="kc-reset-password-form" class="pf-v5-c-form" action="${url.loginAction}" method="post">
                <div class="pf-v5-c-form__group kc-form-group">
                    <label for="username" class="pf-v5-c-form__label-text">
                        <#if !realm.loginWithEmailAllowed>
                            ${msg("username")}
                        <#elseif !realm.registrationEmailAsUsername>
                            ${msg("usernameOrEmail")}
                        <#else>
                            ${msg("email")}
                        </#if>
                    </label>

                    <div class="input-wrapper">
                        <span class="input-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                                      stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M5 20C5.87827 18.2473 7.79086 17 10 17H14C16.2091 17 18.1217 18.2473 19 20"
                                      stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </span>
                        <input id="username"
                               name="username"
                               type="text"
                               class="pf-v5-c-form-control"
                               value="${(auth.attemptedUsername!'')}"
                               autofocus />
                    </div>
                </div>

                <p class="auth-note">We will send reset instructions to the email associated with your account.</p>

                <div id="kc-form-buttons">
                    <input class="pf-v5-c-button pf-m-primary" type="submit" value="${msg("doSubmit")}" />
                </div>
            </form>
        </div>

    <#elseif section = "info">
        <div id="kc-info">
            <a href="${url.loginUrl}">${msg("backToLogin")}</a>
        </div>
    </#if>
</@layout.registrationLayout>
