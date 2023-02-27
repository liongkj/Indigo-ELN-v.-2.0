FROM openjdk:8-jre

WORKDIR /opt/jars
COPY bingodb.war bingodb.war

EXPOSE 9999
ENTRYPOINT java -jar bingodb.war
