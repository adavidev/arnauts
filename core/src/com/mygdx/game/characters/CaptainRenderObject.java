package com.mygdx.game.characters;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.Animation;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.utils.Array;
import com.mygdx.game.core.GameNode;
import com.mygdx.game.core.RenderObject;

/**
 * Created by al on 4/10/2016.
 */
public class CaptainRenderObject extends CharacterRenderObject {

    public CaptainRenderObject(GameNode node) {
        super(node, "EngiDude.png");

        walk = new Texture("Captwalk.png");
        standTex= new Texture("Captstand.png");
        runTrs = new Array<TextureRegion>();
        runTrs.add(new TextureRegion(walk, 0,0,50,50));
        runTrs.add(new TextureRegion(walk, 50,0,50,50));
        runTrs.add(new TextureRegion(walk, 100,0,50,50));
        runTrs.add(new TextureRegion(walk, 150,0,50,50));
        runTrs.add(new TextureRegion(walk, 200,0,50,50));
        runTrs.add(new TextureRegion(walk, 250,0,50,50));
        runTrs.add(new TextureRegion(walk, 300,0,50,50));
        runTrs.add(new TextureRegion(walk, 350,0,50,50));
        runTrs.add(new TextureRegion(walk, 400,0,50,50));
        runTrs.add(new TextureRegion(walk, 450,0,50,50));
        runTrs.add(new TextureRegion(walk, 500,0,50,50));

        tr = new TextureRegion(this, 0,0,50,50);
        right = new Animation(0.1f, runTrs, Animation.PlayMode.LOOP);
        stateTime = 0;

        Array<TextureRegion> leftTrs = new Array<TextureRegion>();
        for (TextureRegion t : runTrs){

            leftTrs.add(new TextureRegion(t));
        }
        for (TextureRegion t : leftTrs){
            t.flip(true, false);
        }
        left = new Animation(0.1f, leftTrs, Animation.PlayMode.LOOP);

        standreg = new Array<TextureRegion>();
        standreg.add(new TextureRegion(standTex, 0,0,50,50));
        standreg.add(new TextureRegion(standTex, 50,0,50,50));
        standreg.add(new TextureRegion(standTex, 100,0,50,50));
        standreg.add(new TextureRegion(standTex, 150,0,50,50));
        standreg.add(new TextureRegion(standTex, 200,0,50,50));
        stand = new Animation(0.1f, standreg, Animation.PlayMode.LOOP);
    }
}
