import { Kafka } from "kafkajs";
import nodemailer from "nodemailer";

export const startSendMailConsumer = async() => {
  try{
    const kafka = new Kafka({
      clientId: 'mail-service',
      brokers: [process.env.Kafka_Broker || 'localhost:9092'],
    })

    const consumer = kafka.consumer({ groupId: "mail-service-group" });

    await consumer.connect();

    const topicName = "send-mail";

    await consumer.subscribe({ topic: topicName, fromBeginning: false });

    console.log("Mail service consumer started, listening for sending mail");

    await consumer.run({
      eachMessage: async({topic, partition, message}) => {
        try {
          const {to, subject, html} = JSON.parse(
            message.value?.toString() || "{}"
          );

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: "tushartayal315@gmail.com",
              pass: "atuoksjoppugnntu"
            },
          });

          transporter.sendMail({
            from: "Hireheaven <no-reply>",
            to,
            subject,
            html,
          });

          console.log(`Mail has been sent to ${to}`);
        } catch(error) {
          console.log("Failed to send mail", error);
        }
      }
    });
  } catch(error) {
    console.log("Fail to start the kafka consumer with message:", error);
  }
}