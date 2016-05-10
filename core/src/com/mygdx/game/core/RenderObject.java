package com.mygdx.game.core;

import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;

/**
 * Created by Alan on 3/29/2016.
 */
public abstract class RenderObject extends Texture implements Comparable<RenderObject> {
    public GameNode myNode;
    public int zIndex = 10;

    public RenderObject(GameNode node, String spriteSheet) {
        super(spriteSheet);
        myNode = node;
//        RenderManager.sprites.add(this);
        RenderManager.add(this);
    }


    public abstract void draw(SpriteBatch batch);

    @Override
    public int compareTo(RenderObject ro) {
        int a = this.zIndex;
        int b = ro.zIndex;
        return a > b ? +1 : a < b ? -1 : 0;
    }
}
