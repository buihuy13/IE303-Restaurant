<#-- Custom modern login page for restaurant-theme -->
<#import "template.ftl" as layout>

<@layout.registrationLayout
    displayMessage=!messagesPerField.existsError('username','password')
    displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>

    <#if section = "header">
        <h1 id="kc-page-title">${msg("loginAccountTitle")}</h1>

    <#elseif section = "form">
        <#if realm.password>
            <div id="kc-form-wrapper">
                <#-- Global and field-specific messages -->
                <#if messagesPerField.existsError('username','password')>
                    <div class="pf-v5-c-alert pf-m-danger alert-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                    </div>
                <#elseif message?has_content>
                    <#assign messageType = (message.type == 'error')?then('danger', message.type)>
                    <div class="pf-v5-c-alert pf-m-${messageType} alert-${message.type}" aria-live="polite">
                        ${kcSanitize(message.summary)?no_esc}
                    </div>
                </#if>

                <form id="kc-form-login" class="pf-v5-c-form" onsubmit="login.disabled = true; return true;"
                      action="${url.loginAction}" method="post">

                    <input type="hidden" id="id-hidden-input" name="credentialId"
                           <#if auth.selectedCredential??>value="${auth.selectedCredential}"</#if> />

                    <#-- Username / email -->
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
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                                          stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                    <path d="M5 20C5.87827 18.2473 7.79086 17 10 17H14C16.2091 17 18.1217 18.2473 19 20"
                                          stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                </svg>
                            </span>
                            <input tabindex="1"
                                   id="username"
                                   name="username"
                                   type="text"
                                   class="pf-v5-c-form-control"
                                   value="${(login.username!'')}"
                                   autocomplete="username"
                                   autofocus />
                        </div>
                    </div>

                    <#-- Password -->
                    <div class="pf-v5-c-form__group kc-form-group">
                        <label for="password" class="pf-v5-c-form__label-text">
                            ${msg("password")}
                        </label>

                        <div class="input-wrapper">
                            <span class="input-icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <rect x="5" y="10" width="14" height="10" rx="2"
                                          stroke="currentColor" stroke-width="1.6" />
                                    <path d="M9 10V8C9 5.79086 10.7909 4 13 4C15.2091 4 17 5.79086 17 8V10"
                                          stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                                </svg>
                            </span>

                            <input tabindex="2"
                                   id="password"
                                   name="password"
                                   type="password"
                                   class="pf-v5-c-form-control"
                                   autocomplete="current-password" />

                            <button type="button"
                                    class="toggle-password"
                                    aria-label="${msg("showPassword")}"
                                    onclick="(function(btn){var input=document.getElementById('password');if(!input)return;var isPwd=input.type==='password';input.type=isPwd?'text':'password';btn.classList.toggle('is-visible', !isPwd);btn.setAttribute('aria-label', isPwd ? '${msg("hidePassword")}' : '${msg("showPassword")}');})(this);">
                                <svg class="toggle-password-icon icon-eye" width="18" height="18" viewBox="0 0 24 24"
                                     fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.5 12C3.5 8.5 7 6 12 6C17 6 20.5 8.5 21.5 12C20.5 15.5 17 18 12 18C7 18 3.5 15.5 2.5 12Z"
                                          stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6" />
                                </svg>
                                <svg class="toggle-password-icon icon-eye-off" width="18" height="18" viewBox="0 0 24 24"
                                     fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 3L21 21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                    <path d="M10.5858 10.5858C10.2107 10.9609 10 11.4696 10 12C10 13.1046 10.8954 14 12 14C12.5304 14 13.0391 13.7893 13.4142 13.4142"
                                          stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                    <path d="M8.99996 5.99998C9.92694 5.67064 10.9474 5.5 12 5.5C16.5 5.5 19.5 8 21 12C20.4932 13.3233 19.8074 14.4601 18.9713 15.4141"
                                          stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                    <path d="M6.00001 6.00002C4.38621 7.08954 3.15847 8.68081 2.5 10.5C4 14.5 7.00001 17 12 17C13.2726 17 14.4144 16.8042 15.4284 16.4468"
                                          stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <#-- Remember me / forgot password -->
                    <#if realm.rememberMe || realm.resetPasswordAllowed>
                        <div id="kc-form-options" class="login-pf-settings">
                            <#if realm.rememberMe>
                                <div class="checkbox">
                                    <label>
                                        <input tabindex="3"
                                               id="rememberMe"
                                               name="rememberMe"
                                               type="checkbox"
                                               <#if login.rememberMe?? && login.rememberMe>checked="checked"</#if> />
                                        ${msg("rememberMe")}
                                    </label>
                                </div>
                            </#if>

                            <#if realm.resetPasswordAllowed>
                                <div class="forgot-password">
                                    <a tabindex="4" href="${url.loginResetCredentialsUrl}">
                                        ${msg("doForgotPassword")}
                                    </a>
                                </div>
                            </#if>
                        </div>
                    </#if>

                    <div id="kc-form-buttons">
                        <input tabindex="5"
                               class="pf-v5-c-button pf-m-primary"
                               name="login"
                               id="kc-login"
                               type="submit"
                               value="${msg("doLogIn")}" />
                    </div>
                </form>
            </div>
        </#if>

    <#elseif section = "socialProviders">
        <#if realm.password && social?? && social.providers?has_content>
            <div id="kc-social-providers" class="kc-social-section">
                <div class="kc-social-divider">
                    <span>${msg("identity-provider-login-label")}</span>
                </div>

                <ul class="kc-social-links">
                    <#list social.providers as p>
                        <li>
                            <a id="social-${p.alias}"
                               class="pf-v5-c-button"
                               href="${p.loginUrl}">
                                <span class="kc-social-provider-logo" aria-hidden="true">
                                    <i class="${p.iconClasses!p.iconCssClass!}"></i>
                                </span>
                                <span class="kc-social-provider-name">
                                    ${p.displayName!p.alias?capitalize}
                                </span>
                            </a>
                        </li>
                    </#list>
                </ul>
            </div>
        </#if>

    <#elseif section = "info">
        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
            <div id="kc-registration">
                <span>${msg("noAccount")}</span>
                <a href="${url.registrationUrl}">${msg("doRegister")}</a>
            </div>
        </#if>
    </#if>

</@layout.registrationLayout>

