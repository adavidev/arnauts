package com.mygdx.game.ship;

import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.core.GameNode;
import com.mygdx.game.core.NodeHolder;
import com.mygdx.game.core.RenderManager;
import com.mygdx.game.core.RenderObject;

/**
 * Created by Alan on 4/18/2016.
 */
public class HullRenderObject {
    public HullRenderObject(GameNode node) {

        Hull h = new Hull(node);
        RenderManager.sort();
    }

    public class Hull extends RenderObject {

        private final Texture hull;
        private Texture hullempty;
        private TextureRegion trhullb, trhullempty, trhulll, trhullr, trhullt, trhullbl, trhullbr, trhulltl, trhulltr;

        public Hull(GameNode node) {
            super(node, "simple/hull.png");
            hull = new Texture("simple/hull.png");
            hullempty = new Texture("hullEmpty.png");

            trhullb = new TextureRegion(hull, 125,0,25,50);
            trhullempty = new TextureRegion(hullempty);
            trhulll = new TextureRegion(hull, 100,0,25,50);
            trhullr = new TextureRegion(hull, 75,0,25,50);
            trhullt = new TextureRegion(hull, 0,0,25,50);
            trhullbl = new TextureRegion(hull, 175,0,25,50);
            trhullbr = new TextureRegion(hull, 150,0,25,50);
            trhulltl = new TextureRegion(hull, 50,0,25,50);
            trhulltr = new TextureRegion(hull, 25,0,25,50);
        }

        @Override
        public void draw(SpriteBatch batch) {
            Ship s = (Ship) myNode.parent;
            Texture tr;

            Vector3 rotup = new Vector3(0,50,0).rotate(NodeHolder.rotAxis, ((Tile) myNode).globalRot).add(((Tile) myNode).globalPos);
            Vector3 rotdn = new Vector3(0,-50,0).rotate(NodeHolder.rotAxis, ((Tile) myNode).globalRot).add(((Tile) myNode).globalPos);

            if (s.get(((Tile) myNode).x + 1, (((Tile) myNode).y)).type == TileType.Walkable) {
                batch.draw(trhulll, myNode.globalPos.x, myNode.globalPos.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
            if (s.get(((Tile) myNode).x - 1, ((Tile) myNode).y).type == TileType.Walkable) {
                batch.draw(trhullr, myNode.globalPos.x, myNode.globalPos.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
            if (s.get(((Tile) myNode).x, (((Tile) myNode).y + 1)).type == TileType.Walkable) {
                batch.draw(trhullb, myNode.globalPos.x, myNode.globalPos.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
            if (s.get(((Tile) myNode).x, (((Tile) myNode).y - 1)).type == TileType.Walkable) {
                batch.draw(trhullt, myNode.globalPos.x, myNode.globalPos.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
            if (s.get(((Tile) myNode).x + 1, (((Tile) myNode).y - 1)).type == TileType.Hull &&
                    s.get(((Tile) myNode).x, (((Tile) myNode).y - 1)).type == TileType.None) {
                batch.draw(trhullbl, rotdn.x, rotdn.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
            if (s.get(((Tile) myNode).x - 1, (((Tile) myNode).y - 1)).type == TileType.Hull &&
                    s.get(((Tile) myNode).x, (((Tile) myNode).y - 1)).type == TileType.None) {
                batch.draw(trhullbr, rotdn.x, rotdn.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
            if (s.get(((Tile) myNode).x + 1, (((Tile) myNode).y + 1)).type == TileType.Hull &&
                    s.get(((Tile) myNode).x, (((Tile) myNode).y + 1)).type == TileType.None) {
                batch.draw(trhulltl, rotup.x, rotup.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
            if (s.get(((Tile) myNode).x - 1, (((Tile) myNode).y + 1)).type == TileType.Hull &&
                    s.get(((Tile) myNode).x, (((Tile) myNode).y + 1)).type == TileType.None) {
                batch.draw(trhulltr, rotup.x, rotup.y, 0, 0, 25, 50, 1, 1, myNode.globalRot);
            }
        }
    }
}
