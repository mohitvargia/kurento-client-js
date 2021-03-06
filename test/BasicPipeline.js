/*
 * (C) Copyright 2013-2014 Kurento (http://kurento.org/)
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the GNU Lesser General Public License
 * (LGPL) version 2.1 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 */

/**
 * {@link MediaPipeline} basic test suite.
 *
 * <p>
 * Methods tested:
 * <ul>
 * <li>{@link HttpEndpoint#getUrl()}
 * </ul>
 * <p>
 * Events tested:
 * <ul>
 * <li>{@link HttpEndpoint#addMediaSessionStartListener(MediaEventListener)}
 * <li>
 * {@link HttpEndpoint#addMediaSessionTerminatedListener(MediaEventListener)}
 * </ul>
 *
 *
 * @author Jesús Leganés Combarro "piranna" (piranna@gmail.com)
 * @version 1.0.0
 *
 */

if (typeof QUnit == 'undefined') {
  QUnit = require('qunit-cli');
  QUnit.load();

  kurentoClient = require('..');

  require('./_common');
  require('./_proxy');
};

QUnit.module('BasicPipeline', lifecycle);

/**
 * Basic pipeline reading a video from a URL and stream it over HTTP
 */
QUnit.asyncTest('Creation', function () {
  var self = this;

  QUnit.expect(4);

  self.pipeline.create('PlayerEndpoint', {
    uri: URL_SMALL
  }, function (error, player) {
    if (error) return onerror(error);

    QUnit.notEqual(player, undefined, 'player');

    self.pipeline.create('HttpGetEndpoint', function (error, httpGet) {
      if (error) return onerror(error);

      QUnit.notEqual(httpGet, undefined, 'httpGet');

      player.connect(httpGet, function (error) {
        QUnit.equal(error, undefined, 'connect');

        if (error) return onerror(error);

        httpGet.getUrl(function (error, url) {
          if (error) return onerror(error);

          QUnit.notEqual(url, undefined, 'URL: ' + url);

          QUnit.start();
        })
      });
    });
  });
});

/**
 * Basic pipeline using a pseudo-syncronous API
 */
QUnit.asyncTest('Pseudo-syncronous API', function () {
  var self = this;

  QUnit.expect(1);

  var pipeline = self.pipeline;

  var player = pipeline.create('PlayerEndpoint', {
    uri: URL_SMALL
  });
  var httpGet = pipeline.create('HttpGetEndpoint');

  player.connect(httpGet);

  httpGet.getUrl(function (error, url) {
    if (error) return onerror(error);

    player.release();

    QUnit.notEqual(url, undefined, 'URL: ' + url);

    QUnit.start();
  });
});

/**
 * Basic pipeline using Transactional API
 */
QUnit.asyncTest('Transactional API', function () {
  var self = this;

  QUnit.expect(2);

  var player;
  var httpGet;

  self.pipeline.transaction(function () {
      player = this.create('PlayerEndpoint', {
        uri: URL_SMALL
      });
      httpGet = this.create('HttpGetEndpoint');

      player.connect(httpGet);
    },
    function (error) {
      QUnit.equal(error, undefined, 'transaction ended');

      if (error) return onerror(error);

      httpGet.getUrl(function (error, url) {
        if (error) return onerror(error);

        player.release();

        QUnit.notEqual(url, undefined, 'URL: ' + url);

        QUnit.start();
      });
    });
});

/**
 * Basic pipeline using transactional plain API
 */
QUnit.asyncTest('Transactional plain API', function () {
  var self = this;

  QUnit.expect(2);

  var pipeline = self.pipeline;

  var tx = pipeline.beginTransaction();
  var player = pipeline.create(tx, 'PlayerEndpoint', {
    uri: URL_SMALL
  });
  var httpGet = pipeline.create(tx, 'HttpGetEndpoint');

  player.connect(tx, httpGet);
  tx.commit(function (error)
    //  pipeline.beginTransaction();
    //    var player  = pipeline.create('PlayerEndpoint', {uri: URL_SMALL});
    //    var httpGet = pipeline.create('HttpGetEndpoint');
    //
    //    player.connect(httpGet);
    //  pipeline.endTransaction(function(error)
    {
      QUnit.equal(error, undefined, 'transaction ended');

      if (error) return onerror(error);

      httpGet.getUrl(function (error, url) {
        if (error) return onerror(error);

        player.release();

        QUnit.notEqual(url, undefined, 'URL: ' + url);

        QUnit.start();
      });
    });
});

/**
 * Create a transaction at beginning and send all commands on it
 */
QUnit.asyncTest('Early transaction', function () {
  var self = this;

  QUnit.expect(1);

  var pipeline = self.pipeline;

  pipeline.transaction(function () {
    var player = pipeline.create('PlayerEndpoint', {
      uri: URL_SMALL
    });
    var httpGet = pipeline.create('HttpGetEndpoint');

    player.connect(httpGet);

    httpGet.getUrl(function (error, url) {
      if (error) return onerror(error);

      player.release();

      QUnit.notEqual(url, undefined, 'URL: ' + url);

      pipeline.release();

      QUnit.start();
    });
  });
});
