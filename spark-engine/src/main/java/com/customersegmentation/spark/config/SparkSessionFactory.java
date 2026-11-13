package com.customersegmentation.spark.config;

import org.apache.spark.sql.SparkSession;

public class SparkSessionFactory {

    private static volatile SparkSession instance;

    private SparkSessionFactory() {}

    public static SparkSession getInstance() {
        if (instance == null || instance.sparkContext().isStopped()) {
            synchronized (SparkSessionFactory.class) {
                if (instance == null || instance.sparkContext().isStopped()) {
                    instance = SparkSession.builder()
                            .appName("CustomerSegmentationSparkEngine")
                            .master("local[*]")
                            .config("spark.ui.enabled", "false")
                            .config("spark.driver.host", "localhost")
                            .config("spark.driver.bindAddress", "127.0.0.1")
                            .config("spark.sql.shuffle.partitions", "2")
                            .config("spark.default.parallelism", "2")
                            .config("spark.driver.extraJavaOptions", "-Djava.security.manager=allow")
                            .getOrCreate();
                }
            }
        }
        return instance;
    }

    public static void stopSession() {
        synchronized (SparkSessionFactory.class) {
            if (instance != null && !instance.sparkContext().isStopped()) {
                instance.stop();
                instance = null;
            }
        }
    }
}

