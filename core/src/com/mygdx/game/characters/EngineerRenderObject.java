package com.mygdx.game.characters;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.g2d.Animation;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.utils.Array;
import com.mygdx.game.core.GameNode;
import com.mygdx.game.core.RenderObject;
import com.sun.xml.internal.ws.policy.privateutil.PolicyUtils;

import java.util.ArrayList;

/**
 * Created by Alan on 3/29/2016.
 */
public class EngineerRenderObject extends CharacterRenderObject {
    public EngineerRenderObject(GameNode node) {
        super(node, "EngiDude.png");
        runTrs = new Array<TextureRegion>();
        runTrs.add(new TextureRegion(this, 0,0,50,50));
        runTrs.add(new TextureRegion(this, 50,0,50,50));
        runTrs.add(new TextureRegion(this, 100,0,50,50));
        runTrs.add(new TextureRegion(this, 150,0,50,50));
        runTrs.add(new TextureRegion(this, 0,50,50,50));
        runTrs.add(new TextureRegion(this, 50,50,50,50));
        runTrs.add(new TextureRegion(this, 100,50,50,50));
        runTrs.add(new TextureRegion(this, 150,50,50,50));
        tr = new TextureRegion(this, 0,0,50,50);
        right = new Animation(0.1f, runTrs, Animation.PlayMode.LOOP);
        stateTime = 0;

        Array<TextureRegion> leftTrs = new Array<TextureRegion>();
        leftTrs.add(new TextureRegion(this, 0,0,50,50));
        leftTrs.add(new TextureRegion(this, 50,0,50,50));
        leftTrs.add(new TextureRegion(this, 100,0,50,50));
        leftTrs.add(new TextureRegion(this, 150,0,50,50));
        leftTrs.add(new TextureRegion(this, 0,50,50,50));
        leftTrs.add(new TextureRegion(this, 50,50,50,50));
        leftTrs.add(new TextureRegion(this, 100,50,50,50));
        leftTrs.add(new TextureRegion(this, 150,50,50,50));
        for (TextureRegion t : leftTrs){
            t.flip(true, false);
        }
        left = new Animation(0.1f, leftTrs, Animation.PlayMode.LOOP);

        standreg = new Array<TextureRegion>();
        standreg.add(new TextureRegion(this, 100,100,50,50));
        stand = new Animation(0.1f, standreg, Animation.PlayMode.LOOP);
    }


}
