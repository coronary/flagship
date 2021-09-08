import React, { useRef } from 'react';
import {
  DeviceEventEmitter,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  OptionsModalPresentationStyle
// tslint:disable-next-line: no-submodule-imports
} from 'react-native-navigation/lib/dist/interfaces/Options';
import * as Animatable from 'react-native-animatable';
import { CardContext, EngagementContext } from '../lib/contexts';
import GestureHandler from '../GestureHandler';

const NEW = 'NEW';
const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 40,
    marginHorizontal: 25
  },
  fullScreen: {
    width: '100%',
    height: '100%'
  },
  newContainer: {
    backgroundColor: '#c41230',
    padding: 2,
    paddingTop: 5,
    width: 40,
    marginBottom: 13,
    alignItems: 'center',
    justifyContent: 'center'
  },
  newText: {
    fontFamily: 'Interstate-Bold',
    fontSize: 12,
    textAlign: 'center',
    color: '#fff'
  }
});

import {
  Action,
  CardProps,
  JSON
} from '../types';
import { TextBlock } from './TextBlock';

export interface ImageProp {
  uri: string;
}
export interface FullScreenCardProps extends CardProps {
  actions?: Action;
  contents: any;
  storyType?: string;
  source: ImageProp;
  isNew?: boolean;
  AnimatedPageCounter?: any;
  AnimatedNavTitle?: any;
  position?: number;
  setScrollEnabled: (enabled: boolean) => void;
}

export const FullScreenImageCard: React.FunctionComponent<FullScreenCardProps> = React.memo(
  props => {
    const { containerStyle, contents } = props;
    const { handleAction, language } = React.useContext(EngagementContext);
    const imageRef = useRef<Animatable.Image & Image>(null);
    const textRef = useRef<Animatable.Text & Text>(null);

    const onBack = () => {
      props.setScrollEnabled(true);
      if (imageRef) {
        imageRef.current?.transitionTo({
          scale: 1,
          opacity: 1
        }, 600, 'ease-out');
      }
      if (props.AnimatedPageCounter) {
        props.AnimatedPageCounter.transitionTo(
          { opacity: 1 },
          400, 'linear');
      }
      if (props.AnimatedNavTitle) {
        props.AnimatedNavTitle.transitionTo(
          { opacity: 1, translateY: 0 },
          400, 'linear');
      }
      if (textRef) {
        textRef.current?.transitionTo(
          { opacity: 1 },
          400, 'linear');
      }
    };

    const handleStoryAction = async (json: JSON) => {
      DeviceEventEmitter.emit('viewStory', {
        title: props.name,
        id: props.id,
        position: props.position
      });
      return props.navigator.showModal({
        stack: {
          children: [{
            component: {
              name: 'EngagementComp',
              options: {
                layout: {
                  backgroundColor: 'transparent'
                },
                modalPresentationStyle: OptionsModalPresentationStyle.overCurrentContext,
                topBar: {
                  visible: false,
                  drawBehind: true
                },
                bottomTabs: {
                  visible: false
                }
              },
              passProps: {
                json,
                backButton: true,
                language,
                name: props.name,
                id: props.id,
                animate: true,
                onBack,
                cardPosition: props.position
              }
            }
          }]
        }
      }).catch((err: any) => console.log('EngagementhandleStoryAction SHOWMODAL error:', err));
    };

    // tslint:disable-next-line:cyclomatic-complexity
    const onCardPress = async (): Promise<void> => {
      const { actions, story, storyGradient, storyType } = props;

      // if there is a story attached and either
      //    1) no actions object
      //    2) actions.type is null or 'story' (new default tappable cards)
      if (story &&
        (!actions || (actions && (actions.type === null || actions.type === 'story')))
      ) {

        if (!(story && story.tabbedItems && story.tabbedItems.length)) {
          if (imageRef) {
            imageRef.current?.transitionTo({
              scale: 1.2,
              opacity: 0.75
            }, 700, 'ease-out');
          }
        }

        if (textRef) {
          textRef.current?.transitionTo({
            opacity: 0
          }, 320, 'linear');
        }

        props.AnimatedPageCounter.transitionTo(
          { opacity: 0 },
          400, 'linear');

        props.AnimatedNavTitle.transitionTo(
          { opacity: 0, translateY: -10 },
          400, 'linear');

        return handleStoryAction({
          ...story,
          storyGradient,
          storyType
        });
      } else if (actions && actions.type) {
        return handleAction(actions);
      }
    };

    const onSwipeUp = async (): Promise<void> => {
      return onCardPress();
    };

    return (
      <GestureHandler
        onSwipe={onSwipeUp}
        setScrollEnabled={props.setScrollEnabled}
      >
        <CardContext.Provider
          value={{
            story: props.story,
            handleStoryAction,
            cardActions: props.actions,
            id: props.id,
            name: props.name
          }}
        >
          <TouchableOpacity
            style={containerStyle}
            onPress={onCardPress}
            activeOpacity={1}
          >
            <View
              accessibilityIgnoresInvertColors={true}
              style={[styles.fullScreen, { backgroundColor: '#000' }]}
            >
              <Animatable.Image
                source={contents.Image.source}
                ref={imageRef}
                useNativeDriver={false}
                style={[StyleSheet.absoluteFill, styles.fullScreen]}
              />
              <Animatable.View
                style={styles.bottom}
                ref={textRef}
                useNativeDriver={false}
              >
                {props.isNew &&
                  (
                  <View
                    style={styles.newContainer}
                  >
                    <Text
                      style={styles.newText}
                    >
                      {NEW}
                    </Text>
                  </View>
                  )}
                <TextBlock
                  {...contents.Eyebrow}
                />
                <TextBlock
                  {...contents.Headline}
                />
              </Animatable.View>
            </View>
          </TouchableOpacity>
        </CardContext.Provider>
      </GestureHandler>
    );
  });
