package com.customersegmentation.spark.model;

import java.io.Serializable;

public class ElbowPoint implements Serializable {

    private static final long serialVersionUID = 1L;

    private int k;
    private double wcss;
    private double silhouetteScore;

    public ElbowPoint() {}

    public ElbowPoint(int k, double wcss, double silhouetteScore) {
        this.k = k;
        this.wcss = wcss;
        this.silhouetteScore = silhouetteScore;
    }

    public int getK() {
        return k;
    }

    public void setK(int k) {
        this.k = k;
    }

    public double getWcss() {
        return wcss;
    }

    public void setWcss(double wcss) {
        this.wcss = wcss;
    }

    public double getSilhouetteScore() {
        return silhouetteScore;
    }

    public void setSilhouetteScore(double silhouetteScore) {
        this.silhouetteScore = silhouetteScore;
    }
}

