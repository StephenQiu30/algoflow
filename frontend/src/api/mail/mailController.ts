// @ts-ignore
/* eslint-disable */
import request from '@/lib/request'

/** 异步发送邮件 基于 MQ 分离发送流程，提升接口吞吐量 POST /mail/send/async */
export async function doSendMailAsync(body: MailAPI.MailSendRequest,
                                      options ?: { [key: string]: any }
) {
    return request<MailAPI.BaseResponseBoolean>('/mail/send/async', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

/** 同步发送邮件 阻塞式发送简单或 HTML 邮件 POST /mail/send/sync */
export async function doSendMailSync(body: MailAPI.MailSendRequest,
                                     options ?: { [key: string]: any }
) {
    return request<MailAPI.BaseResponseBoolean>('/mail/send/sync', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

/** 发送验证码邮件 按模板发送验证码内容，验证码由调用方生成并传入 POST /mail/send/verification-code */
export async function doSendVerificationCode(body: MailAPI.MailSendCodeRequest,
                                             options ?: { [key: string]: any }
) {
    return request<MailAPI.BaseResponseBoolean>('/mail/send/verification-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

