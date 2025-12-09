import { useContext, useState } from 'react';
import { useCanvasDraw } from './useCanvasDraw';
import { ScenarioMapContext } from '../ScenarioMapContext';
import { IconType, IModelBase, NodeBoxType } from '../models/model-types';

//Drawing Constants
import {
  nodeSize,
  fontHeight,
  iconSize,
  iconSizePlusPad,
  subnetColor,
} from '../constants';


export const useScenarioMapDraw = () => {
  const draw = useCanvasDraw();
  const {
    nodeBoxes,
    nodes,
    connectors,
    positions,
    width,
    height,
    onLayoutInit,
  } = useContext(ScenarioMapContext);
  const [drawCount, setDrawCount] = useState(0);
  //Adjustment to center device nodes on line start positions
  //Layout is done based on top left alignment
  //But drawing bumps devices up and over in order to center them on line starts
  const halfAdjX = 16;
  const halfAdjY = 16;

  const borderThickness = 1;
  const shouldDebug = false;
  const shouldDrawNodes = true;
  const shouldDrawNodeBoxes = true;
  const shouldDrawConnectors = true;
  const shouldDrawSubnets = true;

  const layoutPosition = (
    obj: IModelBase,
    input: number[], //left, top, maxRowHeight - alternate algorithms use this so retain
    maxBoardRight: number,
  ) => {
    if (!positions?.hasOwnProperty(obj.id)) {
      console.log('Graph Data Not Found For ', obj.id);
      return;
    }

    var graphNode = positions[obj.id];
    obj.setPosition(graphNode.x, graphNode.y);
  };

  const layoutLinePosition = (
    obj: IModelBase,
    input: number[], //left, top, maxRowHeight
    maxBoardRight: number,
  ) => {
    if (!obj.meta) {
      return;
    }

    const fromModel: string = obj.meta['from'];
    const toModel: string = obj.meta['to'];

    if (
      !fromModel ||
      !toModel ||
      !positions?.hasOwnProperty(fromModel) ||
      !positions?.hasOwnProperty(toModel)
    ) {
      console.log('Graph Data Not Found From or To Sources For Model ', obj.id);
      return;
    }

    var fromNode = positions[fromModel];
    var toNode = positions[toModel];

    obj.setPosition(fromNode.x, fromNode.y);
    obj.width = toNode.x;
    obj.height = toNode.y;
  };

  const nextPosition = (
    obj: IModelBase,
    input: number[], //left, top, maxRowHeight
    maxBoardRight: number,
  ) => {
    //left, top, maxrowheight
    if (input[0] + obj.width > maxBoardRight) {
      input[0] = 0;
      input[1] += input[2];
      input[2] = 0;
    } else {
      //place at xx, yy
    }
    obj.setPosition(input[0], input[1]);
    input[0] = input[0] + obj.width;
    input[2] = Math.max(input[2], obj.height);
  };

  const getIconSource = (iconType: IconType) => {
    switch (iconType) {
      // case IconType.CLOUD:
      //   return cloud;
      // case IconType.DUMB_SWITCH:
      //   return dumbswitch;
      // case IconType.FILE_SERVER:
      //   return fileserver;
      // case IconType.FIREWALL:
      //   return firewall;
      // case IconType.INTERNET:
      //   return cloud;
      // case IconType.MAIL_SERVER:
      //   return mailserver;
      // case IconType.ROUTER:
      //   return router;
      // case IconType.SERVER:
      //   return server;
      // case IconType.SMART_SWITCH:
      //   return smartswitch;
      // case IconType.WEB_SERVICE:
      //   return webservice;
      // case IconType.WORK_STATION:
      //   return workstation;
      default:
        return null;
    }
  };

  /**
   * For debugging purposes, displays a grid of all the items that should be included in layout
   * Alternate algorithms use the initial positioning
   * TODO - comment contents
   */
  const initializeDraw = (context: CanvasRenderingContext2D) => {
    if (!shouldDebug) {
      draw.clearRect(context);

      //global draw styles
      draw.setFont(context, '11px Arial');

      if (onLayoutInit) {
        onLayoutInit();
      }
    } else {
      //REF below for debug
      //console.log('drawing');
      draw.clearRect(context);

      //global draw styles
      draw.setFont(context, '11px Arial');

      let layout = [0, 0, 0];

      if (shouldDrawNodeBoxes) {
        // Draw Node Boxes
        for (let i = 0; i < nodeBoxes.length; i++) {
          const obj = nodeBoxes[i];
          //TODO maybe remove empty from the model
          if (obj.nodeBoxType !== NodeBoxType.CONTAINS_DEVICE) {
            continue;
          }

          const titleText = obj.name + ' ' + obj.meta['ip'];

          //box needs to fit title and devices
          obj.setTitleWidth(draw.getTextWidth(context, titleText));
          nextPosition(nodeBoxes[i], layout, 1024);
          draw.drawText(context, titleText, obj.x, obj.y + fontHeight);
          draw.drawRect(
            context,
            obj.x,
            obj.y + fontHeight,
            obj.width,
            obj.innerHeight,
            borderThickness,
            subnetColor,
          );
        }
      }

      if (shouldDrawNodes) {
        // Draw Nodes
        for (let i = 0; i < nodes.length; i++) {
          const obj = nodes[i];
          var iconSource = getIconSource(obj.iconType);
          if (iconSource) {
            if (obj.parent && obj.childIndex >= 0) {
              obj.x = obj.parent.x + obj.childX;
              obj.y = obj.parent.y + fontHeight + obj.childY;
            } else {
              nextPosition(nodes[i], layout, 1024);
            }
            draw.drawRect(
              context,
              obj.x,
              obj.y,
              obj.width,
              obj.height,
              0,
              '#50C8C805',
            );
            draw.drawImage(
              context,
              iconSource,
              obj.x,
              obj.y,
              iconSize,
              iconSize,
            );
            draw.drawText(
              context,
              obj.name,
              obj.x,
              obj.y + iconSizePlusPad,
              nodeSize,
            );
          }
        }
      }

      if (shouldDrawConnectors) {
        // Draw Lines
        for (let i = 0; i < connectors.length; i++) {
          const obj = connectors[i];

          nextPosition(connectors[i], layout, 1024);
          draw.drawText(context, obj.name, obj.x, obj.y + fontHeight);
          draw.drawLine(
            context,
            obj.x,
            obj.y,
            obj.x + obj.width,
            obj.y + obj.height,
          );
        }
      }
    }
  };

  /**
   * Draws nodes, node boxes, and connectors into web gl canvas
   */
  const drawModel = (context: CanvasRenderingContext2D) => {
    draw.clearRect(context, 0, 0, width, height);

    setDrawCount(drawCount + 1);

    //global draw styles
    draw.setFont(context, '11px Arial');

    let layout = [0, 0, 0];
    let xx = 0;
    let yy = 0;

    if (shouldDrawConnectors) {
      // Draw Lines
      for (let i = 0; i < connectors.length; i++) {
        const obj = connectors[i];
        layoutLinePosition(connectors[i], layout, 1024);

        if (obj.x >= 9999 || obj.x + obj.width >= 9999) {
          continue;
        }

        //DEBUG draw.drawText(context, obj.name, obj.x, obj.y + fontHeight);
        draw.drawLine(context, obj.x, obj.y, obj.width, obj.height);
      }
    }

    if (shouldDrawNodeBoxes) {
      // Draw Node Boxes
      for (let i = 0; i < nodeBoxes.length; i++) {
        const obj = nodeBoxes[i];
        //TODO maybe remove empty from the model
        if (obj.nodeBoxType !== NodeBoxType.CONTAINS_DEVICE) {
          continue;
        }

        const titleText = obj.name + ' ' + obj.meta['ip'];

        //box needs to fit title and devices
        obj.setTitleWidth(draw.getTextWidth(context, titleText));
        layoutPosition(nodeBoxes[i], layout, 1024);
        xx = obj.x - halfAdjX;
        yy = obj.y - halfAdjY;
        draw.drawRect(
          context,
          xx,
          yy + fontHeight,
          obj.width,
          obj.innerHeight, //need to adjust for drawText below (innerHeight + fontHeight must equal collision height used for detecting overlap)
          borderThickness,
          subnetColor,
        );
        draw.drawText(context, titleText, xx, yy + fontHeight);
      }
    }

    if (shouldDrawNodes) {
      // Draw Nodes
      for (let i = 0; i < nodes.length; i++) {
        const obj = nodes[i];
        var iconSource = getIconSource(obj.iconType);
        if (iconSource) {
          if (obj.parent && obj.childIndex >= 0) {
            //console.log('draw child' + obj.childIndex + ' ' + obj.name, obj);
            obj.x = obj.parent.x + obj.childX;
            obj.y = obj.parent.y + fontHeight + obj.childY;
          } else {
            //console.log('skip name ' + obj.name, obj);
            layoutPosition(nodes[i], layout, 1024);
          }

          if (shouldDrawSubnets || !obj.parent) {
            //draw.drawRect(context, obj.x, obj.y, radius, radius, 0, fakeColor);
            xx = obj.x - halfAdjX;
            yy = obj.y - halfAdjY;
            draw.drawRect(
              context,
              xx,
              yy,
              obj.width,
              obj.height,
              0,
              '#50C8C805',
            );

            draw.drawImage(context, iconSource, xx, yy, iconSize, iconSize);
            draw.drawText(
              context,
              obj.label || obj.name,
              xx,
              yy + iconSizePlusPad,
              nodeSize,
            );
          }
        }
      }
    }
  };

  return {
    initializeDraw,
    drawModel,
  };
};
