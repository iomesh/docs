---
id: install-and-setup-iomesh
title: Install and Setup IOMesh
sidebar_label: Install and Setup IOMesh
---

IOMesh using IOMesh Operator to manage the IOMesh Cluster. IOMesh Operator will watch-and-list IOMeshCluster CR. When CR changes, IOMesh Operator will perform some corresponding operations, such as deployment/uninstallation/scaling, etc.

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

## Install IOMesh Cluster

Follow the steps below to install a IOMesh Cluster.

1. Install iomesh chart

> **_NOTE_: `my-iomesh` is release name, maybe you want to modify it.**

Please choose your **node** OS:
<!--DOCUSAURUS_CODE_TABS-->

<!--RHEL7/CentOS7-->

```bash
export IOMESH_DATA_CIDR=10.234.1.0/24 # data network CIDR
curl -sSL https://iomesh.run/install_iomesh_el7.sh | sh -
```

<!--RHEL8/CentOS8/CoreOS-->

```bash
export IOMESH_DATA_CIDR=10.234.1.0/24 # data network CIDR
curl -sSL https://iomesh.run/install_iomesh_el8.sh | sh -
```
<!--END_DOCUSAURUS_CODE_TABS-->

2. Check your installation and wait for IOMesh Cluster pods all ready

```bash
watch kubectl get --namespace iomesh-system pods
```

> **_NOTE_: `chunk` server may fall in `CrashLoop`. Don't worry, after you [setup data network][2]. They will be Ready**

## Customize IOMesh Cluster

The basic install only make the cluster run. If you want to change some config of the cluster, such as image url, tolerations or mount device etc. You can follow the step to customize your own IOMesh Cluster

### Deploy Snapshot Controller

> Only for `Kubernetes >= v1.13.0`

Volume Snapshot Controller manages the snapshot CRDs.
There must be **only one instance** of Volume Snapshot Controller running and **only one set** of volume snapshot CRDs installed per cluster.

1. Clone **[Kubernetes CSI external-controller](https://github.com/kubernetes-csi/external-snapshotter/tree/release-2.1)**

```shell
curl -LO https://github.com/kubernetes-csi/external-snapshotter/archive/release-2.1.zip
unzip release-2.1.zip && cd external-snapshotter-release-2.1
```

2. Create Snapshot beta CRD

```shell
kubectl create -f ./config/crd
```

3. Open and edit `deploy/kubernetes/snapshot-controller/setup-snapshot-controller.yaml`. Add a namespace for StatefulSet. eg. `kube-system`

   Editing results are showing below.

   ```yaml
   kind: StatefulSet
   apiVersion: apps/v1
   metadata:
     name: snapshot-controller
     namespace: kube-system # <-- Add namespace here
   # ...
   ```

4. Open and edit `deploy/kubernetes/snapshot-controller/rbac-snapshot-controller.yaml`. Add a namespace for StatefulSet. eg. `kube-system`

   Editing results are showing below.

   ```yaml
   apiVersion: v1
   kind: ServiceAccount
   metadata:
     name: snapshot-controller
     namespace: kube-system # <-- Add namespace here
   # ...
   ```

5. Install Snapshot Controller

```shell
kubectl apply -f ./deploy/kubernetes/snapshot-controller
```

6. Verify snapshot-controller installation

```shell
kubectl get sts snapshot-controller -n kube-system
```

```output
NAME                  READY   AGE
snapshot-controller   1/1     32s
```

### Install IOMesh Operator

1. Export default `iomesh-operator.yaml` of IOMesh Operator chart

```bash
helm show values iomesh/operator > iomesh-operator.yaml
```

2. Edit the `iomesh-operator.yaml`

3. Install IOMesh Operator

> **_NOTE_: `my-iomesh-operator` is release name, maybe you want to modify it.**
```
helm install my-iomesh-operator iomesh/operator \
	       	--namespace iomesh-system \
	       	--create-namespace \
	       	--wait
```

4. Wait IOMesh Operator ready

```
watch kubectl get --namespace iomesh-system pods
```

### Install IOMesh Cluster

1. Export default `iomesh-values.yaml` of IOMesh Cluster chart

```bash
helm show values iomesh/iomesh > iomesh-values.yaml
```

2. Edit the `iomesh-values.yaml` with any text editor you love

3. Or, you want to install a new IOMesh Cluster

> **_NOTE_: `my-iomesh` is release name, maybe you want to modify it.**

```bash
helm install my-iomesh iomesh/iomesh \
    --create-namespace \
    --namespace iomesh-system \
    --values iomesh-values.yaml \
    --wait
```

4. Wait IOMesh Cluster pod ready

```
watch kubectl get --namespace iomesh-system pods
```

### Install IOMesh CSI driver

1. Export default `iomesh-csi-driver.yaml` of IOMesh Cluster chart

```bash
helm show values iomesh/csi-driver > iomesh-csi-driver.yaml
```

2. Edit `iomesh-csi-driver.yaml`

If your chunk node is `CentOS8` or `CoreOS`, please set `mountIscsiLock` to `true`

```yaml
driver:
  node:
    driver:
      mountIscsiLock: true
```

3. Install IOMesh CSI driver

> **_NOTE_: `my-iomesh-csi-driver` is release name, maybe you want to modify it.**

```bash
helm install my-iomesh-csi-driver iomesh/csi-driver \
    --create-namespace \
    --namespace iomesh-system \
    --values iomesh-csi-driver.yaml \
    --wait
```

4. Wait IOMesh Cluster pod ready

```
watch kubectl get --namespace iomesh-system pods
```

[1]: http://iomesh.com/charts
[2]: http://www.iomesh.com/docs/installation/setup-iomesh-storage#setup-data-network