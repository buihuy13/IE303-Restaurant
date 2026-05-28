<#-- Custom update profile page for restaurant-theme -->
<#import "template.ftl" as layout>
<#import "user-profile-commons.ftl" as userProfileCommons>

<@layout.registrationLayout
    displayMessage=!messagesPerField.existsError('firstName','lastName','email','username')
    displayRequiredFields=true; section>

    <#if section = "header">
        <h1 id="kc-page-title">${msg("loginProfileTitle")}</h1>
        <p class="auth-subtitle">Please complete or update your profile information.</p>

    <#elseif section = "form">
        <div id="kc-form-wrapper">
            <#if message?has_content>
                <#assign messageType = (message.type == 'error')?then('danger', message.type)>
                <div class="pf-v5-c-alert pf-m-${messageType} alert-${message.type}" aria-live="polite">
                    ${kcSanitize(message.summary)?no_esc}
                </div>
            </#if>

            <form id="kc-update-profile-form" class="pf-v5-c-form" action="${url.loginAction}" method="post">
                <@userProfileCommons.userProfileFormFields; callback, attribute>
                    <#if callback = "beforeField">
                        <div class="pf-v5-c-form__group kc-form-group">
                    <#elseif callback = "afterField">
                        </div>
                    </#if>
                </@userProfileCommons.userProfileFormFields>

                <p class="auth-note">Your profile details help personalize your account and secure sign-in.</p>

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
