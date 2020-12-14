---
id: version-2.0.0-overview
title: ZBS Operator Overview
sidebar_label: Overview
original_id: overview
---

**Project status: *alpha***. Not all planned features are completed, ZBS Operator API may change.



## Overview

ZBS Operator provides a [Kubernetes Operator][1], which provides native deployment and management of [ZBS][2]. It makes deploying, scaling or even upgrading ZBS cluster easier than ever before.

ZBS Operator will continuously watch for the MetaCluster and ChunkCluster CR and will doing reconciliation and monitoring.



[1]: https://kubernetes.io/docs/concepts/extend-kubernetes/operator/	"Kubernetes - Operator pattern"
[2]: https://www.smartx.com/smtx-zbs/	"SmartX ZBS"



## Features

- Deployment and uninstallation of ZBS storage clusters
- Support rolling upgrade of ZBS storage cluster
- Support the scaling of ZBS storage clusters:
  - Add or remove ZBS component replicas
  - Plug or unplug disk from ZBS storage clusters
- Support health monitoring of ZBS storage clusters



## Getting started

Simply use [Helm][1] to get things done.

```bash
# add iomesh repo in Helm
helm repo add iomesh iomesh.com/charts

# install zbs-operator
helm install --create-namespace --namespace iomesh-system my-zbs-operator iomesh/zbs-operator

# install ZBS with default values
helm install my-zbs iomesh/zbs
```

For a more detailed version of ZBS Operator deployment, checkout [the Deployment section of ZBS Operator Documents][0].

[0]: http://iomesh.com/docs/zbs-operator/deployment	"ZBS Operator Deployment"
[1]: https://helm.sh/	"Helm - The package manager for Kubernetes"



## Compatibility list with Kubernetes

| ZBS Operator Version | Kubernetes Version |
| -------------------- | ------------------ |
| v0.1.0               | v1.17 or higher    |

