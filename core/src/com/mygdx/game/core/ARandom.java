package com.mygdx.game.core;

import java.util.Random;

/**
 * Created by al on 5/10/2016.
 */
public class ARandom {


    public static int rand(int seed, int bound){
        Random rand = new Random(seed);
        return rand.nextInt(bound);
    }

    public static void main(String[] args){
        System.out.println(ARandom.rand(1234, 10));
        System.out.println(ARandom.rand(1234, 10));
        System.out.println(ARandom.rand(1234, 10));
        System.out.println(ARandom.rand(1234, 10));
    }
}
