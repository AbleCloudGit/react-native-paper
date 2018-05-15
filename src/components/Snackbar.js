/* @flow */

import * as React from 'react';
import { StyleSheet, Animated, View } from 'react-native';

import Button from './Button';
import Text from './Typography/Text';
import ThemedPortal from './Portal/ThemedPortal';
import withTheme from '../core/withTheme';
import { white } from '../styles/colors';
import type { Theme } from '../types';

type Props = {
  /**
   * Whether the Snackbar is currently visible.
   */
  visible: boolean,
  /**
   * Label and press callback for the action button. It should contains following properties:
   * - `label` - Label of the action button
   * - `onPress` - Callback that is called when action button is pressed.
   */
  action?: {
    label: string,
    onPress: () => mixed,
  },
  /**
   * The duration for which the Snackbar is shown.
   */
  duration?: number,
  /**
   * Callback called when Snackbar is dismissed. The `visible` prop needs to be updated when this is called.
   */
  onDismiss: () => mixed,
  /**
   * Text content of the Snackbar.
   */
  children: React.Node,
  style?: any,
  /**
   * @optional
   */
  theme: Theme,
};

type State = {
  scale: Animated.Value,
};

const SNACKBAR_ANIMATION_DURATION = 200;

/**
 * Snackbar provide brief feedback about an operation through a message at the bottom of the screen.
 *
 * <div class="screenshots">
 *   <img class="medium" src="screenshots/snackbar.gif" />
 * </div>
 *
 * ## Usage
 * ```js
 * import React from 'react';
 * import { Snackbar, StyleSheet } from 'react-native-paper';
 *
 * export default class MyComponent extends React.Component {
 *   state = {
 *     visible: false,
 *   };
 *
 *   render() {
 *     const { visible } = this.state;
 *     return (
 *       <View style={styles.container}>
 *         <Button
 *           raised
 *           onPress={() => this.setState(state => ({ visible: !state.visible }))}
 *         >
 *           {this.state.visible ? 'Hide' : 'Show'}
 *         </Button>
 *         <Snackbar
 *           visible={this.state.visible}
 *           onDismiss={() => this.setState({ visible: false })}
 *           action={{
 *             label: 'Undo',
 *             onPress: () => {
 *               // Do something
 *             },
 *           }}
 *         >
 *           Hey there! I'm a Snackbar.
 *         </Snackbar>
 *       </View>
 *     );
 *   }
 * }
 *
 * const styles = StyleSheet.create({
 *   container: {
 *     flex: 1,
 *     justifyContent: 'space-between',
 *   },
 * });
 * ```
 */
class Snackbar extends React.Component<Props, State> {
  /**
   * Show the Snackbar for a short duration.
   */
  static DURATION_SHORT = 4000;

  /**
   * Show the Snackbar for a long duration.
   */
  static DURATION_LONG = 6000;

  /**
   * Show the Snackbar for indefinite amount of time.
   */
  static DURATION_INDEFINITE = Infinity;

  static defaultProps = {
    duration: this.DURATION_LONG,
  };

  state = {
    scale: new Animated.Value(0),
  };

  componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible) {
      this._toggle();
    }
  }

  componentWillUnmount() {
    clearTimeout(this._hideTimeout);
  }

  _hideTimeout: TimeoutID;

  _toggle = () => {
    if (this.props.visible) {
      this._show();
    } else {
      this._hide();
    }
  };

  _show = () => {
    clearTimeout(this._hideTimeout);

    Animated.timing(this.state.scale, {
      toValue: 1,
      duration: SNACKBAR_ANIMATION_DURATION,
    }).start(() => {
      const { duration } = this.props;

      if (duration !== Snackbar.DURATION_INDEFINITE) {
        this._hideTimeout = setTimeout(this.props.onDismiss, duration);
      }
    });
  };

  _hide = () => {
    clearTimeout(this._hideTimeout);

    this.state.scale.setValue(0);
  };

  render() {
    const { children, visible, action, onDismiss, theme, style } = this.props;
    const { colors, roundness } = theme;

    return (
      <ThemedPortal>
        <Animated.View
          style={[
            styles.wrapper,
            {
              opacity: visible ? 1 : 0,
              transform: [
                {
                  scale: this.state.scale,
                },
              ],
            },
            style,
          ]}
        >
          <View style={[styles.container, { borderRadius: roundness }]}>
            <Text style={[styles.content, { marginRight: action ? 0 : 16 }]}>
              {children}
            </Text>
            {action ? (
              <Button
                onPress={() => {
                  action.onPress();
                  onDismiss();
                }}
                style={styles.button}
                color={colors.accent}
                compact
                mode="text"
              >
                {action.label.toUpperCase()}
              </Button>
            ) : null}
          </View>
        </Animated.View>
      </ThemedPortal>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  container: {
    elevation: 6,
    backgroundColor: '#323232',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 8,
    borderRadius: 4,
  },
  content: {
    color: white,
    marginLeft: 16,
    marginVertical: 14,
    flexWrap: 'wrap',
    flex: 1,
  },
  button: {
    marginHorizontal: 8,
    marginVertical: 6,
  },
});

export default withTheme(Snackbar);
