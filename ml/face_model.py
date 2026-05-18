import torch
import torch.nn as nn
import torchvision.models as models


class RGBBranch(nn.Module):
    def __init__(self):
        super().__init__()

        model = models.efficientnet_b0(
            weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1
        )

        self.features = model.features
        self.pool = nn.AdaptiveAvgPool2d(1)

        self.out_dim = 1280

    def forward(self, x):
        x = self.features(x)
        x = self.pool(x)

        return x.view(x.size(0), -1)


class FFTBranch(nn.Module):
    def __init__(self):
        super().__init__()

        self.net = nn.Sequential(
            nn.Conv2d(1, 16, 3, padding=1),
            nn.ReLU(),

            nn.Conv2d(16, 32, 3, padding=1),
            nn.ReLU(),

            nn.Conv2d(32, 64, 3, padding=1),
            nn.ReLU(),

            nn.AdaptiveAvgPool2d(1)
        )

        self.out_dim = 64

    def forward(self, x):
        x = self.net(x)

        return x.view(x.size(0), -1)


class FaceDeepfakeDetector(nn.Module):
    def __init__(self):
        super().__init__()

        self.rgb_branch = RGBBranch()
        self.fft_branch = FFTBranch()

        fusion_dim = (
            self.rgb_branch.out_dim +
            self.fft_branch.out_dim
        )

        self.head = nn.Sequential(
            nn.Linear(fusion_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.3),

            nn.Linear(256, 1)
        )

    def forward(self, rgb, fft):

        B, T, C, H, W = rgb.shape

        rgb = rgb.view(B * T, C, H, W)
        fft = fft.view(B * T, 1, H, W)

        rgb_feat = self.rgb_branch(rgb)
        fft_feat = self.fft_branch(fft)

        feat = torch.cat(
            [rgb_feat, fft_feat],
            dim=1
        )

        feat = feat.view(B, T, -1)

        feat = feat.mean(dim=1)

        out = self.head(feat)

        return out.squeeze(1)