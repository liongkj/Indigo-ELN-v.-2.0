/*
 *  Copyright (C) 2015-2018 EPAM Systems
 *
 *  This file is part of BingoDB.
 *
 *  BingoDB is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  BingoDB is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with BingoDB.  If not, see <http://www.gnu.org/licenses/>.
 */
package com.epam.indigoeln.bingodb.config;

import com.epam.indigo.Indigo;
import org.springframework.context.annotation.Configuration;

/**
 * Provider for Indigo instances creation with common properties.
 */
@Configuration
public class IndigoProvider {

    /**
     * Create a new Indigo instance with common properties.
     *
     * @return Indigo instance with common properties
     */
    public Indigo indigo() {
        Indigo indigo = new Indigo();
        indigo.setOption("ignore-stereochemistry-errors", "true");

        return indigo;
    }
}