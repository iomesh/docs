---
id: installiomesh
title: Install and Setup IOMesh
sidebar_label: Install and Setup IOMesh
---

Before you deploy IOMesh cluster, you should deploy IOMesh Operator first. IOMesh Operator will watch-and-list ZBSCluster CR. When CR changes, IOMesh Operator will perform some corresponding operations, such as deployment/uninstallation/scaling, etc.

## Supported Platforms

- Kubernetes v1.17 or higher, check [Compatibility list](https://iomesh.com/docs/zbs-operator/overview#compatibility-list-with-kubernetes)
- Helm 3

## Setup Helm

Please refer to **[Install Helm](https://helm.sh/docs/intro/install/)**

> If it's not allowed to install on the Kubernetes Node, install helm locally.

```bash
$ curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
$ chmod 700 get_helm.sh
$ ./get_helm.sh
```

## Deploy IOMesh Operator

Follow the steps below to deploy a IOMesh Operator.

1. Add [IOMesh Helm Repo][1]

```bash
helm repo add iomesh iomesh.com/charts
```

2. Prepare hostpath dir

IOMesh Operator will deploy hostpath-provisioner who manages local storage in pvc/pv way.  IOMesh Operator will use hostpath-provisioner'pv to deploy IOMesh cluster.

```bash
# Execute the following commands on each worker node
mkdir -p /mnt/iomesh/hostpath
mount /dev/<formatted-partition> /mnt/iomesh/hostpath
```

> NOTE: append a fstab entry to `/etc/fstab` to persist hostpath's mount operation

3. Install zbs-operator chart

NOTE: `my-zbs-operator` is release name, maybe you want to modify it.

```bash
helm install --namespace iomesh-system --create-namespace my-zbs-operator iomesh/zbs-operator --version 0.1.0 --set hostpath-provisioner.pvDir=/mnt/iomesh/hostpath
```

4. Check your installation and wait for zbs-operator pods all ready

```bash
watch kubectl get -n iomesh-system pods
```

[1]: http://iomesh.com/charts