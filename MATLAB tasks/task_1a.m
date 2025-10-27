function n = crown_glass(lambda)
    %Convert to microns
    x = lambda/1000;
    %Sellmeier coefficients
    a = [1.03961212, 0.231792344, 1.01146945];
    b = [0.00600069867, 0.0200179144, 103.560653];
    %Build up formula for refractive index
    y = zeros(size(x));
    for k=1:length(a)
        y = y + ( a(k)*x.^2 )./( x.^2 - b(k) );
    end
n = sqrt( 1 + y );
end 

% Wavelength range
lambda = 400:800;
% Refractive indices
n = crown_glass(lambda);

% Plot graph
figure;
plot(lambda, n, 'LineWidth', 2);
xlabel('Wavelength/nm');
ylabel('Refractive Index');
title('Dispersion of BK7 Crown Glass');
grid on;