CWjQuery(document).ready(function($) {

    CW.YMCATC_GoogleMapComponentOutput = CW.GoogleMapComponentOutput.extend({
        init: function(args) {
            var mapLocation = document
                    .location
                    .href
                    .match(/&?[amp;]?map_location=([\w|\+]*)&?[amp;]?/),
                component = this;

            this._super(args);
            if (!navigator.geolocation) {
                CWjQuery('.with-geo').remove();
            } else {}
            this.component_el.find('.loc .btn-submit')
                .on('click', CWjQuery.proxy(this.apply_search, this));

            this.search_field_el.on('keypress', function(e) {
                if (e.keyCode == 13) component.apply_search();
            });
            if (mapLocation) {
                jQuery('.search_field')
                    .val(mapLocation[1].replace(/\+/g, ' '));

                jQuery('.distance_limit option')
                    .eq(2)
                    .attr('selected', true);
                jQuery('.loc .btn-submit')
                    .click();
            }

            google
                .maps
                .event
                .addListenerOnce(
                this.map,
                'bounds_changed',
                function() {
                    if (this.getZoom()) {
                        this.setZoom(this.getZoom() + 1);
                    }
                }
            );
        },
        init_map: function() {

            this.center_point = new google.maps.LatLng(
                this.map_data.center_point[0],
                this.map_data.center_point[1]);

            this.map = new google.maps.Map(this.map_el[0], {
                scaleControl: true,
                center: this.center_point,
                zoom: 9,
                scrollwheel: false,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });

            this.init_map_center();

            this.component_el.trigger('initialized', [this.map]);
        },
        draw_map_locations: function() {

            var locations = this.apply_filters(this.locations);

            // If the location list is empty, don't adjust the map at all
            if (locations.length === 0) {
                this.map.setCenter(this.search_center_point);
                return;
            }

            var bounds = new google.maps.LatLngBounds();

            for (i = 0; i < locations.length; i++) {

                var loc = locations[i];

                bounds.extend(loc.marker.getPosition());

                loc.marker.setVisible(true);

            }

            this.map.fitBounds(bounds);

        },
        // Renders an extra set of filter boxes below the map.
        draw_map_controls: function() {

            this.init_active_tags();

            var tag_filters_html = '';

            for (var tag in this.tags) {

                var filter_checked = '';

                if (CWjQuery.inArray(tag, this.initial_active_tags) >= 0) {
                    filter_checked = 'checked="checked"';
                }

                tag_filter_html = '<label class="btn btn-default" for="tag_' + tag + '">';

                tag_filter_html += '<input autocomplete="off" id="tag_' + tag + '" class="tag_' + tag + '" type="checkbox" value="' + tag + '" ' + filter_checked + '/>' + tag;

                for (var i = 0; i < this.tags[tag].marker_icons.length; i++) {
                    tag_filter_html += '<img class="tag_icon inline-hidden-sm" src="' + this.tags[tag].marker_icons[i] + '"/>';
                }

                tag_filter_html += '</label>';

                tag_filters_html += tag_filter_html;
            }

            this.map_controls_el.find('.tag_filters').append(tag_filters_html);

        },



        // executed every time a checkbox bar filter state changes
        bar_filter_change: function(evt) {

            var evt_target = CWjQuery(evt.currentTarget);

            var matching_checkbox = this.map_controls_el.find('input.' + evt_target.attr('class') + '[type=checkbox]');

            // Uncheck all checkboxes

            this.map_controls_el.find('input[type=checkbox]').prop('checked', false);
            this.component_el.find('nav.types input[type=checkbox]').prop('checked', false);
            this.component_el.find('nav.types label').removeClass('checked');


            // Check the just-clicked one

            matching_checkbox.prop('checked', true);
            evt_target.prop('checked', true);

            evt_target.parents('label').addClass('checked');

            this.filter_change();
        },


        // executed every time a checkbox filter state changes
        filter_change: function(evt) {

            if (evt) {

                var evt_target = CWjQuery(evt.currentTarget);

                var matching_bar_checkbox = this.component_el.find('nav.types input.' + evt_target.attr('class') + '[type=checkbox]');

                matching_bar_checkbox.prop('checked', evt_target.prop('checked'));

                matching_bar_checkbox.parents('label').toggleClass('checked', evt_target.prop('checked'));
            }

            this._super();
        },


        // attaches events to various map controls
        hookup_map_controls_events: function() {
            this._super();

            this.component_el.find('nav.types input[type=checkbox]').on('change', CWjQuery.proxy(this.bar_filter_change, this));


        },
        // Render the list of locations
        draw_list_locations: function() {
            var list_locations_html = '';

            column_index = 0;
            var locations = this.apply_filters(this.locations);

            if (!locations.length) {
                this.location_list_el.hide().html('<div class="col-xs-12 text-center"><p>We\u2019re sorry no results were found in your area</p></div>').fadeIn();
                return;
            }

            if (locations[0].distance >= 0) {
                locations.sort(function(a, b) {
                    return a.distance - b.distance;
                });
            }

            for (l = 0; l < locations.length; l++) {

                var list_item = '<div class="location col-xs-12 col-sm-4 col-md-3">';
                list_item += this.draw_list_location(locations[l]);
                list_item += '</div>';
                list_locations_html += list_item;

                column_index++;
                if (column_index == this.n_list_columns) column_index = 0;
            }

            this.location_list_el.hide().html(list_locations_html).fadeIn();

        },

        build_google_url: function(str) {
            str = str.trim();
            str = str.replace(/ /g, "+");

            if (str.length > 0) {
                str += '+';
            }
            return str;
        },

        // Generate the HTML for a single location in the list
        draw_list_location: function(loc) {
            var url = typeof(rewrite_preview_redirect) != 'undefined' ?
                rewrite_preview_redirect(loc.url, 2) : loc.url;

            var google_url = '//www.google.com/maps/place/' + this.build_google_url(loc.address1) + this.build_google_url(loc.address2) + this.build_google_url(loc.city) + this.build_google_url(loc.state) + this.build_google_url(loc.zip);

            var results = '';
            if (loc.name) {
                results += '<article>' +
                    '<div class="adr address">' +
                    '<a class="wrapper" href="' + url + '">' +
                    '<h3 class="n">' +
                    loc.name + '</h3></a><p>';
            }
            if (loc.address1) {
                results += loc.address1;
            }
            if (loc.address2) {
                results += '<br/>' + loc.address2;
            }
            if (loc.city) {
                results += '<br/>' + loc.city;
            }
            if (loc.state) {
                results += ', ' + loc.state;
            }
            if (loc.zip) {
                results += ' ' + loc.zip;
            }
            if (loc.distance) {
                results += ' <strong><nobr>(' + parseInt(loc.distance * 10, 10) / 10 + ' miles)</nobr></strong>';
            }
            results += '<br/><a class="location-directions n" href="' + google_url + '" target="_blank">Get Directions</a></p></div>';
            if (loc.phone) {
                results += '<p class="tel"><a href="tel:' + loc.phone + '">' + loc.phone + '</a></p>';
            }

            if (loc['HRS Mon-Fri']) {
                results += '<p>';
                results += '<strong>Mon - Fri</strong> <br>' + loc['HRS Mon-Fri'];
                results += '<br/><strong>Sat - Sun</strong> <br>' + loc['HRS Sat-Sun'];
                results += '</p>';
            }

            results += '</article>';
            return results;

        },

        // Populates an array of active tags from an URL parameter "map_tag_filter"
        init_active_tags: function() {

            this._super();

            var url_parameters = getParameters();

            var tag_filter_url_value = url_parameters.map_tag_filter;

            var tag_filter_url_values = (tag_filter_url_value) ? tag_filter_url_value.split(",") : [];

            if (tag_filter_url_values.length === 0) {
                this.initial_active_tags = ['YMCA'];
            }

        },
        locate_me: function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;

            this.search_center_point = new google.maps.LatLng(lat, lng);

            this.map.setCenter(this.search_center_point);
            this.map.setZoom(14);
            if (position.coords.accuracy <= 15840) { // 3 miles

                this.geocoder.geocode({
                        'latLng': this.search_center_point
                    },
                    CWjQuery.proxy(
                        function(results, status) {
                            if (results[0]) this.search_field_el.val(results[0].formatted_address);
                            this.apply_search();
                        },
                        this));

                navigator.geolocation.clearWatch(this.geolocation_watcher);
            }

            this.draw_search_center();
        },
        apply_search: function() {
            var q = this.search_field_el.val();

            var f = function(results, status) {

                if (status == 'OK') {

                    this.search_center_point = results[0].geometry.location;

                    if (results[0].geometry.bounds) {
                        this.map.fitBounds(results[0].geometry.bounds);
                    } else {
                        bounds = new google.maps.LatLngBounds();
                        bounds.extend(this.search_center_point);
                        this.map.fitBounds(bounds);
                    }

                    this.search_center = this.map.getCenter();
                    this.draw_search_center();
                    this.apply_distance_limit();

                }
            };

            this.geocoder.geocode({
                'address': q
            }, CWjQuery.proxy(f, this));

        }
    });

    window.c_617244 = new CW.YMCATC_GoogleMapComponentOutput({
        component_id: '617244',
        component_type: 'map',
        map_data: drupalSettings.locations,
        marker_image_url: drupalSettings.path.baseUrl + 'themes/custom/ymca/img/map_icon_blue.png',
        shadow_image_url: ''
    });
});