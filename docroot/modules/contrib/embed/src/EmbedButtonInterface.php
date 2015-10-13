<?php

/**
 * @file
 * Contains \Drupal\embed\EmbedButtonInterface.
 */

namespace Drupal\embed;

use Drupal\Core\Config\Entity\ConfigEntityInterface;
use Drupal\editor\EditorInterface;

/**
 * Provides an interface defining a embed button entity.
 */
interface EmbedButtonInterface extends ConfigEntityInterface {

  /**
   * Returns the embed type for which this button is enabled.
   *
   * @return string
   *   Machine name of the embed type.
   */
  public function getTypeId();

  /**
   * Returns the label of the embed type for which this button is enabled.
   *
   * @return string
   *   Human readable label of the embed type.
   */
  public function getTypeLabel();

  /**
   * Returns the plugin of the embed type for which this button is enabled.
   *
   * @return \Drupal\embed\EmbedType\EmbedTypeInterface
   *   The plugin of the embed type.
   */
  public function getTypePlugin();

  /**
   * Gets the value of a embed type setting.
   *
   * @param string $key
   *   The setting name.
   * @param mixed $default
   *   The default value
   *
   * @return mixed
   *   The value.
   */
  public function getTypeSetting($key, $default = NULL);

  /**
   * Gets all embed type settings.
   *
   * @return array
   *   An array of key-value pairs.
   */
  public function getTypeSettings();

  /**
   * Returns the button's icon file.
   *
   * @return \Drupal\file\FileInterface
   *   The file entity of the button icon.
   */
  public function getIconFile();

  /**
   * Returns the URL of the button's icon.
   *
   * @return string
   *   The URL of the button icon.
   */
  public function getIconUrl();

}
