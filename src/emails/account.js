const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'hcgaron@gmail.com',
        subject: 'Thanks for joining hanzymusic!',
        text: `Welcome to the app ${name}.  Let me know how you like it!`,
        html: '<h1>Just some email testing</h1>' // optional
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'hcgaron@gmail.com',
        subject: 'Sorry to see you leave',
        text: `Sorry to see you leave ${name}.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}