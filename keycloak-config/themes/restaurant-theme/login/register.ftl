<#-- Custom modern register page for restaurant-theme -->
<#import "template.ftl" as layout>
<#import "register-commons.ftl" as registerCommons>

<@layout.registrationLayout
    displayMessage=messagesPerField.exists('global')
    displayRequiredFields=false; section>

    <#if section = "header">
        <h1 id="kc-page-title">${msg("registerTitle")}</h1>

    <#elseif section = "form">

        <#if messagesPerField.existsError('global')>
            <div class="pf-v5-c-alert pf-m-danger alert-error" aria-live="polite">
                ${kcSanitize(messagesPerField.getFirstError('global'))?no_esc}
            </div>
        <#elseif message?has_content>
            <#assign messageType = (message.type == 'error')?then('danger', message.type)>
            <div class="pf-v5-c-alert pf-m-${messageType} alert-${message.type}" aria-live="polite">
                ${kcSanitize(message.summary)?no_esc}
            </div>
        </#if>

        <form id="kc-register-form"
              class="pf-v5-c-form"
              action="${url.registrationAction}"
              method="post"
              onsubmit="(function(f){try{var btn=f.querySelector('[data-submit]');if(btn){btn.disabled=true;btn.classList.add('is-loading');btn.setAttribute('aria-busy','true');} }catch(e){} return true;})(this);">
            <input type="hidden" id="id-hidden-input" name="credentialId"
                   <#if register.formData.credentialId??>value="${register.formData.credentialId}"</#if> />

            <#-- Username (if not email as username) -->
            <#if !realm.registrationEmailAsUsername>
                <div class="pf-v5-c-form__group kc-form-group">
                    <label for="username" class="pf-v5-c-form__label-text">
                        ${msg("username")} <span aria-hidden="true">*</span>
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
                        <input id="username"
                               name="username"
                               type="text"
                               class="pf-v5-c-form-control"
                               value="${(register.formData.username!'')}" />
                    </div>

                    <#if messagesPerField.existsError('username')>
                        <p class="pf-v5-c-form__helper-text pf-m-error" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('username'))?no_esc}
                        </p>
                    </#if>
                </div>
            </#if>

            <#-- Email -->
            <div class="pf-v5-c-form__group kc-form-group">
                <label for="email" class="pf-v5-c-form__label-text">
                    ${msg("email")} <span aria-hidden="true">*</span>
                </label>

                <div class="input-wrapper">
                    <span class="input-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <rect x="4" y="5" width="16" height="14" rx="2"
                                  stroke="currentColor" stroke-width="1.6" />
                            <path d="M5 7L12 11.5L19 7"
                                  stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                                  stroke-linejoin="round" />
                        </svg>
                    </span>
                    <input id="email"
                           name="email"
                           type="email"
                           class="pf-v5-c-form-control"
                           value="${(register.formData.email!'')}" />
                </div>

                <#if messagesPerField.existsError('email')>
                    <p class="pf-v5-c-form__helper-text pf-m-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('email'))?no_esc}
                    </p>
                </#if>
            </div>

            <#-- Password -->
            <div class="pf-v5-c-form__group kc-form-group">
                <label for="password" class="pf-v5-c-form__label-text">
                    ${msg("password")} <span aria-hidden="true">*</span>
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

                    <input id="password"
                           name="password"
                           type="password"
                           class="pf-v5-c-form-control"
                           autocomplete="new-password" />

                    <button type="button"
                            class="toggle-password"
                            data-target="password"
                            aria-label="${msg("showPassword")}"
                            onclick="(function(btn){
                                var targetId = btn.getAttribute('data-target');
                                var input = document.getElementById(targetId);
                                if (!input) return;
                                var isPwd = input.type === 'password';
                                input.type = isPwd ? 'text' : 'password';
                                btn.classList.toggle('is-visible', !isPwd);
                                btn.setAttribute('aria-label', isPwd ? '${msg("hidePassword")}' : '${msg("showPassword")}');
                            })(this);">
                        <svg class="toggle-password-icon" width="18" height="18" viewBox="0 0 24 24"
                             fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 12C3.5 8.5 7 6 12 6C17 6 20.5 8.5 21.5 12C20.5 15.5 17 18 12 18C7 18 3.5 15.5 2.5 12Z"
                                  stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                                  stroke-linejoin="round" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6" />
                        </svg>
                    </button>
                </div>

                <#if messagesPerField.existsError('password')>
                    <p class="pf-v5-c-form__helper-text pf-m-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('password'))?no_esc}
                    </p>
                </#if>
            </div>

            <#-- Confirm password -->
            <div class="pf-v5-c-form__group kc-form-group">
                <label for="password-confirm" class="pf-v5-c-form__label-text">
                    ${msg("passwordConfirm")} <span aria-hidden="true">*</span>
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

                    <input id="password-confirm"
                           name="password-confirm"
                           type="password"
                           class="pf-v5-c-form-control"
                           autocomplete="new-password" />

                    <button type="button"
                            class="toggle-password"
                            data-target="password-confirm"
                            aria-label="${msg("showPassword")}"
                            onclick="(function(btn){
                                var targetId = btn.getAttribute('data-target');
                                var input = document.getElementById(targetId);
                                if (!input) return;
                                var isPwd = input.type === 'password';
                                input.type = isPwd ? 'text' : 'password';
                                btn.classList.toggle('is-visible', !isPwd);
                                btn.setAttribute('aria-label', isPwd ? '${msg("hidePassword")}' : '${msg("showPassword")}');
                            })(this);">
                        <svg class="toggle-password-icon" width="18" height="18" viewBox="0 0 24 24"
                             fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 12C3.5 8.5 7 6 12 6C17 6 20.5 8.5 21.5 12C20.5 15.5 17 18 12 18C7 18 3.5 15.5 2.5 12Z"
                                  stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                                  stroke-linejoin="round" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6" />
                        </svg>
                    </button>
                </div>

                <#if messagesPerField.existsError('password-confirm')>
                    <p class="pf-v5-c-form__helper-text pf-m-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                    </p>
                </#if>
            </div>

            <@registerCommons.termsAcceptance/>

            <#if recaptchaRequired?? && (recaptchaVisible!false)>
                <div class="pf-v5-c-form__group kc-form-group">
                    <div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}"></div>
                </div>
            </#if>

            <div id="kc-form-buttons">
                <#if recaptchaRequired?? && !(recaptchaVisible!false)>
                    <script>
                        function onSubmitRecaptcha(token) {
                            document.getElementById("kc-register-form").requestSubmit();
                        }
                    </script>
                    <button
                        class="pf-v5-c-button pf-m-primary g-recaptcha"
                        data-submit="true"
                        data-sitekey="${recaptchaSiteKey}"
                        data-callback="onSubmitRecaptcha"
                        data-size="invisible">
                        ${msg("doRegister")}
                    </button>
                <#else>
                    <input class="pf-v5-c-button pf-m-primary"
                           data-submit="true"
                           type="submit"
                           value="${msg("doRegister")}" />
                </#if>
            </div>
        </form>

    <#elseif section = "info">
        <div id="kc-info">
            <a href="${url.loginUrl}">${msg("backToLogin")}</a>
        </div>
    </#if>

</@layout.registrationLayout>

