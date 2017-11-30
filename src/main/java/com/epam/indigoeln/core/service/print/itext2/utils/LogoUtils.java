package com.epam.indigoeln.core.service.print.itext2.utils;

import com.epam.indigoeln.core.service.print.itext2.model.common.image.PdfImage;
import com.epam.indigoeln.core.service.print.itext2.model.common.image.PngPdfImage;
import org.apache.commons.io.IOUtils;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;

/**
 * Class provides functionality for loading logo.
 */
public final class LogoUtils {
    private static final String LOGO_FILE_NAME = "pdf/logo_new_blue.png";

    private LogoUtils() {
    }

    /**
     * Loads logo from resources.
     *
     * @return Logo's pdf image
     */
    public static PdfImage loadDefaultLogo() {
        try {
            ClassLoader cl = LogoUtils.class.getClassLoader();
            InputStream resourceAsStream = cl.getResourceAsStream(LOGO_FILE_NAME);
            return new PngPdfImage(IOUtils.toByteArray(resourceAsStream));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
