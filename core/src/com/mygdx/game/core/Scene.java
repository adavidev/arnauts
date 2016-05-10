package com.mygdx.game.core;

import com.mygdx.game.core.GameNode;

import java.util.ArrayList;

/**
 * Created by Alan on 3/28/2016.
 */
public class Scene extends NodeHolder {

    public static Scene currentScene = null;

    public Scene(){
        super();
    }

    public void set(){
        currentScene = this;
    }


}
