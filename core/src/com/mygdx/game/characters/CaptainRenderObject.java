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

        int wi = 52;
        int ht = 50;

        int slow = 0;
        int shigh = 13;
        int wlow = 14;
        int whigh = 29;

        walk = new Texture("capt_all_anims.png");
        standTex = walk;

        runTrs = new Array<TextureRegion>();
        for (int i = wlow; i <= whigh; i++) {
            runTrs.add(new TextureRegion(walk, 50 * i,0,50,51));
        }

        tr = new TextureRegion(this, 0,0,50,50);
        right = new Animation(anim_speed, runTrs, Animation.PlayMode.LOOP);
        stateTime = 0;

        Array<TextureRegion> leftTrs = new Array<TextureRegion>();
        for (TextureRegion t : runTrs){

            leftTrs.add(new TextureRegion(t));
        }
        for (TextureRegion t : leftTrs){
            t.flip(true, false);
        }
        left = new Animation(anim_speed, leftTrs, Animation.PlayMode.LOOP);

        standreg = new Array<TextureRegion>();
        for (int i = slow; i <= shigh; i++) {
            standreg.add(new TextureRegion(standTex, 50 * i,0,50,51));
        }

        stand = new Animation(anim_speed, standreg, Animation.PlayMode.LOOP);
    }
}
