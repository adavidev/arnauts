package com.mygdx.game.core;

import java.util.ArrayList;

/**
 * Created by al on 4/11/2016.
 */
public class TDArray<T> extends ArrayList<ArrayList<T>> {

    public void addToInnerArray(int index, T element) {
        while (index >= this.size()) {
            this.add(new ArrayList<T>());
        }
        this.get(index).add(element);
    }

    public void addToInnerArray(int index, int index2, T element) {
        expand(index, index2);

        get(index).set(index2, element);
    }

    public T get(int x, int y){
        expand(x,y);
        return get(x).get(y);
    }

    private void expand(int index1, int index2){
        while (index1 >= this.size()) {
            this.add(new ArrayList<T>());
        }

        ArrayList<T> inner = this.get(index1);
        while (index2 >= inner.size()) {
            inner.add(null);
        }
    }

    public static void main(String[] args){
        TDArray<String> td = new TDArray<String>();
        td.addToInnerArray(2,4,"YOLO");
        System.out.println(td.get(2,4));
    }
}
