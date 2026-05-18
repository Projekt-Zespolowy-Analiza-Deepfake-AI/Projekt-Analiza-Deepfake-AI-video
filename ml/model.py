import torch
import torch.nn as nn
import torchvision.models as models

class RGBBranch(nn.Module):
    def __init__(self):
        super().__init__()

        model = models.efficientnet_b0(weights="IMAGENET1K_V1")

        self.features = model.features
        self.pool = nn.AdaptiveAvgPool2d(1)

        self.out_dim = 1280

    def forward(self, x):
        # x: (B, 3, 224, 224)
        x = self.features(x)
        x = self.pool(x)
        x = x.view(x.size(0), -1)
        return x

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
        # x: (B, 1, 224, 224)
        x = self.net(x)
        x = x.view(x.size(0), -1)
        return x

class DeepfakeDetector(nn.Module):
    def __init__(self):
        super().__init__()

        self.rgb_branch = RGBBranch()
        self.fft_branch = FFTBranch()

        fusion_dim = self.rgb_branch.out_dim + self.fft_branch.out_dim

        self.head = nn.Sequential(
            nn.Linear(fusion_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.3),

            nn.Linear(256, 1)
        )

    def forward(self, rgb, fft):
        # rgb: (B,T,3,224,224)
        # fft: (B,T,1,224,224)

        B, T, C, H, W = rgb.shape

        rgb = rgb.view(B * T, C, H, W)
        fft = fft.view(B * T, 1, H, W)

        rgb_feat = self.rgb_branch(rgb)
        fft_feat = self.fft_branch(fft)

        feat = torch.cat([rgb_feat, fft_feat], dim=1)

        feat = feat.view(B, T, -1)

        # predykcja dla każdej klatki
        frame_logits = self.head(feat)

        # (B,T)
        frame_logits = frame_logits.squeeze(-1)

        # średnia wyników klatek
        out = frame_logits.mean(dim=1)

        return out